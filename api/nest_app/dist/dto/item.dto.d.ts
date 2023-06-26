import { Item } from '../model/item.model';
export declare class GetItemsResponse {
    items: Item[];
}
export declare class GetItemsRequest {
    ids: Item['id'][];
}
