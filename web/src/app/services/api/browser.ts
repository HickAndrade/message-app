"use client";

import axios from "axios";

import { getPublicApiBaseUrl } from "./url";

export const browserApi = axios.create({
    baseURL: getPublicApiBaseUrl(),
    withCredentials: true
});
