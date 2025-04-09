import { API } from "./BASEURL";

const api = API();
const fetchGroups = async () => {
    try {
        const response = await api.get("/groups");
        return response.data;
    } catch (error) {
        return error
    }
}



export {fetchGroups}