import axios, { type AxiosInstance } from "axios";
import { LoadingHelper } from "../components/helpers/LoadingHelper";
import { sessionExpired } from "./session";

export class HttpApiServices {

    axios: AxiosInstance;
    countReq: number;

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

        const onFinish = () => {
            this.countReq--;
            if (this.countReq === 0) {
                LoadingHelper.displayOff();
            }
        };

        this.axios.interceptors.response.use(
            (response) => {
                onFinish();
                return response;
            },
            (error) => {
                // Sem isto, uma requisição com erro deixava o "carregando" preso na tela.
                onFinish();

                if (sessionExpired(error?.response?.status, localStorage.getItem('token'))) {
                    localStorage.clear();
                    window.location.href = '/';
                }
                return Promise.reject(error);
            }
        );
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
