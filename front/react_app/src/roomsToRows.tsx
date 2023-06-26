import { GridRowsProp } from '@mui/x-data-grid';
import { Room } from '../model/room.model';

export function roomsToRows(response: any): GridRowsProp {
  return response.data.Rooms.map((room: Room) => ({
    id: room.id.toString(),
    roomName: room.name
  }));
}
