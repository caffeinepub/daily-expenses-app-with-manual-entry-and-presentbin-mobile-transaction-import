import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface ImportSummary {
    imported: bigint;
    skippedDuplicates: bigint;
    failed: bigint;
}
export interface ExpenseRecord {
    id: number;
    source: TransactionSource;
    note: string;
    currency: string;
    createdTimestamp: Time;
    category: string;
    transactionDateTime: Time;
    amount: number;
}
export interface UserProfile {
    name: string;
}
export interface PresentbinTransaction {
    note: string;
    currency: string;
    fingerprint: string;
    category: string;
    transactionDateTime: Time;
    amount: number;
}
export enum TransactionSource {
    presentbin = "presentbin",
    manual = "manual"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addExpenseRecord(amount: number, currency: string, category: string, note: string, transactionDateTime: Time): Promise<number>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteExpenseRecord(id: number): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExpenseRecords(): Promise<Array<ExpenseRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    importPresentbinTransactions(transactions: Array<PresentbinTransaction>): Promise<ImportSummary>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateExpenseRecord(id: number, amount: number, currency: string, category: string, note: string, transactionDateTime: Time): Promise<boolean>;
}
