import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Nat32 "mo:core/Nat32";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    name : Text;
  };

  type TransactionSource = {
    #manual;
    #presentbin;
  };

  type ExpenseRecord = {
    id : Nat32;
    amount : Nat32;
    currency : Text;
    category : Text;
    note : Text;
    transactionDateTime : Time.Time;
    source : TransactionSource;
    createdTimestamp : Time.Time;
  };

  module ExpenseRecord {
    public func compareByCreatedTimestamp(a : ExpenseRecord, b : ExpenseRecord) : Order.Order {
      Nat32.compare(Nat32.fromIntWrap(a.createdTimestamp), Nat32.fromIntWrap(b.createdTimestamp));
    };
  };

  type PresentbinTransaction = {
    amount : Nat32;
    currency : Text;
    category : Text;
    note : Text;
    transactionDateTime : Time.Time;
    fingerprint : Text;
  };

  type ImportSummary = {
    imported : Nat;
    skippedDuplicates : Nat;
    failed : Nat;
  };

  // Persistent storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let expenseRecords = Map.empty<Principal, Map.Map<Nat32, ExpenseRecord>>();
  let usedFingerprints = Map.empty<Principal, Set.Set<Text>>();
  let nextExpenseId = Map.empty<Principal, Nat32>();

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Expense management functions
  public query ({ caller }) func getExpenseRecords() : async [ExpenseRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expense records");
    };
    let records = switch (expenseRecords.get(caller)) {
      case (null) { Map.empty<Nat32, ExpenseRecord>() };
      case (?records) { records };
    };
    records.values().toArray();
  };

  public shared ({ caller }) func addExpenseRecord(
    amount : Nat32,
    currency : Text,
    category : Text,
    note : Text,
    transactionDateTime : Time.Time
  ) : async Nat32 {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add expense records");
    };

    let id = getNextExpenseId(caller);
    let expenseRecord : ExpenseRecord = {
      id;
      amount;
      currency;
      category;
      note;
      transactionDateTime;
      source = #manual;
      createdTimestamp = Time.now();
    };

    let records = switch (expenseRecords.get(caller)) {
      case (null) { Map.empty<Nat32, ExpenseRecord>() };
      case (?records) { records };
    };
    records.add(id, expenseRecord);
    expenseRecords.add(caller, records);

    id;
  };

  public shared ({ caller }) func updateExpenseRecord(
    id : Nat32,
    amount : Nat32,
    currency : Text,
    category : Text,
    note : Text,
    transactionDateTime : Time.Time
  ) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update expense records");
    };

    let records = switch (expenseRecords.get(caller)) {
      case (null) { return false };
      case (?records) { records };
    };

    switch (records.get(id)) {
      case (null) { false };
      case (?existingRecord) {
        let updatedRecord : ExpenseRecord = {
          id = existingRecord.id;
          amount;
          currency;
          category;
          note;
          transactionDateTime;
          source = existingRecord.source;
          createdTimestamp = existingRecord.createdTimestamp;
        };
        records.add(id, updatedRecord);
        expenseRecords.add(caller, records);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteExpenseRecord(id : Nat32) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete expense records");
    };

    let records = switch (expenseRecords.get(caller)) {
      case (null) { return false };
      case (?records) { records };
    };

    let existed = records.containsKey(id);
    if (existed) {
      records.remove(id);
      expenseRecords.add(caller, records);
    };
    existed;
  };

  // Presentbin import function
  public shared ({ caller }) func importPresentbinTransactions(transactions : [PresentbinTransaction]) : async ImportSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can import transactions");
    };

    var importedCount : Nat = 0;
    var skippedCount : Nat = 0;
    var failedCount : Nat = 0;

    let records = switch (expenseRecords.get(caller)) {
      case (null) { Map.empty<Nat32, ExpenseRecord>() };
      case (?records) { records };
    };

    let fingerprints = switch (usedFingerprints.get(caller)) {
      case (null) { Set.empty<Text>() };
      case (?existingFingerprints) { existingFingerprints };
    };

    for (transaction in transactions.vals()) {
      if (fingerprints.contains(transaction.fingerprint)) {
        skippedCount += 1;
      } else {
        let id = getNextExpenseId(caller);
        let expenseRecord : ExpenseRecord = {
          id;
          amount = transaction.amount;
          currency = transaction.currency;
          category = transaction.category;
          note = transaction.note;
          transactionDateTime = transaction.transactionDateTime;
          source = #presentbin;
          createdTimestamp = Time.now();
        };

        records.add(id, expenseRecord);
        fingerprints.add(transaction.fingerprint);
        importedCount += 1;
      };
    };

    expenseRecords.add(caller, records);
    usedFingerprints.add(caller, fingerprints);

    {
      imported = importedCount;
      skippedDuplicates = skippedCount;
      failed = failedCount;
    };
  };

  // Helper function to generate unique IDs per user
  func getNextExpenseId(user : Principal) : Nat32 {
    let currentId = switch (nextExpenseId.get(user)) {
      case (null) { 1 : Nat32 };
      case (?id) { id };
    };
    nextExpenseId.add(user, currentId + 1);
    currentId;
  };
};
