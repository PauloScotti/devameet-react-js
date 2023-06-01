import { HttpApiServices } from "./HttpApiServices";


export class MeetServices extends HttpApiServices {

    baseUrl = '/meet';

    async getMeets() {
        return await this.get(this.baseUrl);
    }

    async deleteMeets(id: string) {
        return await this.delete(this.baseUrl + '/' + id);
    }
}