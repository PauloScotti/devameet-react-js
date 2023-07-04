import axios, { type AxiosInstance } from "axios";
import { LoadingHelper } from "../components/helpers/LoadingHelper";

export class HttpApiServices {
    axios: AxiosInstance;
    countReq: any;

    constructor() {
        this.axios = axios.create({
            baseURL: import.meta.env.VITE_PUBLIC_API_URL + '/api'
        });

        this.countReq = 0;

        this.axios.interceptors.request.use((config: any) => {
            const token = localStorage.getItem('token');
            this.countReq++;
            if (this.countReq === 1) {
                LoadingHelper.displayOn();
            }

            if (token) {
                config.headers.Authorization = 'Bearer ' + token;
            }

            return config;
        });

        this.axios.interceptors.response.use((response) => {
            this.countReq--;
            if (this.countReq === 0) {
                LoadingHelper.displayOff();
            }

            return response;
        });
    }

    post(url: string, data: any) {
        return this.axios.post(url, data);
    }

    get(url: string) {
        return this.axios.get(url);
    }

    put(url: string, data: any) {
        return this.axios.put(url, data);
    }

    delete(url: string) {
        return this.axios.delete(url);
    }
}