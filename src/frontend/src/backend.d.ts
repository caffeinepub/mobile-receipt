import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Category {
    id: string;
    icon: string;
    name: string;
    updatedAt: Time;
}
export interface Settings {
    updatedAt: Time;
    currency: string;
}
export interface BillItem {
    itemId: string;
    quantity: bigint;
    price: bigint;
}
export type Time = bigint;
export interface Item {
    id: string;
    categoryId: string;
    name: string;
    updatedAt: Time;
    price: bigint;
}
export interface Bill {
    id: string;
    total: bigint;
    date: string;
    updatedAt: Time;
    items: Array<BillItem>;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getBills(): Promise<Array<Bill>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<Category>>;
    getItems(): Promise<Array<Item>>;
    getPdfBlob(id: string): Promise<ExternalBlob | null>;
    getSettings(): Promise<Settings | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    syncBill(bill: Bill): Promise<void>;
    syncCategory(category: Category): Promise<void>;
    syncItem(item: Item): Promise<void>;
    syncSettings(settings: Settings): Promise<void>;
    uploadPdfBlob(id: string, blob: ExternalBlob): Promise<void>;
}
