/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by Payload.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

export interface Config {
    collections: {
        users: User;
        reservations: Reservation;
        "offer-images": OfferImage;
        categories: Category;
        sub_categories: SubCategory;
        menu_items: MenuItem;
        "payload-preferences": PayloadPreference;
        "payload-migrations": PayloadMigration;
    };
    globals: {
        menu: Menu;
        contact_info: ContactInfo;
        offers: Offer;
        deployment: Deployment;
    };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users".
 */
export interface User {
    id: string;
    role: "admin" | "staff" | "public";
    updatedAt: string;
    createdAt: string;
    email: string;
    resetPasswordToken?: string | null;
    resetPasswordExpiration?: string | null;
    salt?: string | null;
    hash?: string | null;
    loginAttempts?: number | null;
    lockUntil?: string | null;
    password: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "reservations".
 */
export interface Reservation {
    id: string;
    first_name: string;
    last_name: string;
    tel: string;
    date: string;
    party_size: string;
    updatedAt: string;
    createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "offer-images".
 */
export interface OfferImage {
    id: string;
    updatedAt: string;
    createdAt: string;
    url?: string | null;
    filename?: string | null;
    mimeType?: string | null;
    filesize?: number | null;
    width?: number | null;
    height?: number | null;
    focalX?: number | null;
    focalY?: number | null;
    sizes?: {
        thumbnail?: {
            url?: string | null;
            width?: number | null;
            height?: number | null;
            mimeType?: string | null;
            filesize?: number | null;
            filename?: string | null;
        };
    };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "categories".
 */
export interface Category {
    id: string;
    name: string;
    index: number;
    sub_categories?: (string | SubCategory)[] | null;
    menu_items?: (string | MenuItem)[] | null;
    updatedAt: string;
    createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "sub_categories".
 */
export interface SubCategory {
    id: string;
    name: string;
    menu_items?: (string | MenuItem)[] | null;
    index: number;
    updatedAt: string;
    createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "menu_items".
 */
export interface MenuItem {
    id: string;
    name: string;
    price: number;
    index: number;
    updatedAt: string;
    createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences".
 */
export interface PayloadPreference {
    id: string;
    user: {
        relationTo: "users";
        value: string | User;
    };
    key?: string | null;
    value?:
        | {
              [k: string]: unknown;
          }
        | unknown[]
        | string
        | number
        | boolean
        | null;
    updatedAt: string;
    createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations".
 */
export interface PayloadMigration {
    id: string;
    name?: string | null;
    batch?: number | null;
    updatedAt: string;
    createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "menu".
 */
export interface Menu {
    id: string;
    categories: {
        category_name: string;
        main_items?:
            | {
                  item: string;
                  price: number;
                  id?: string | null;
              }[]
            | null;
        sub_categories?:
            | {
                  sub_category_name: string;
                  sub_category_items: {
                      item: string;
                      price: number;
                      id?: string | null;
                  }[];
                  id?: string | null;
              }[]
            | null;
        id?: string | null;
    }[];
    updatedAt?: string | null;
    createdAt?: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "contact_info".
 */
export interface ContactInfo {
    id: string;
    phone_numbers: {
        phone_number: number;
        id?: string | null;
    }[];
    email: string;
    address: string;
    google_maps_link: string;
    updatedAt?: string | null;
    createdAt?: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "offers".
 */
export interface Offer {
    id: string;
    list: {
        menu_item: string | MenuItem;
        image: string | OfferImage;
        id?: string | null;
    }[];
    updatedAt?: string | null;
    createdAt?: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "deployment".
 */
export interface Deployment {
    id: string;
    updatedAt?: string | null;
    createdAt?: string | null;
}
