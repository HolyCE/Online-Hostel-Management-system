import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

interface Room {
  id: number;
  roomNumber: string;
  type: string;
  capacity: number;
  price: number;
  status: "available" | "occupied" | "maintenance";
  floor: number;
  occupants?: number;
}

export default function BasicTableOne() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/rooms`);
      if (response.data.success) {
        const formattedRooms = response.data.data.slice(0, 5).map((room: any, index: number) => ({
          id: index + 1,
          roomNumber: room.roomNumber,
          type: room.price > 300000 ? "Suite" : room.price > 200000 ? "Deluxe" : "Standard",
          capacity: room.capacity,
          price: room.price,
          status: room.status,
          floor: room.floorNumber,
          occupants: room.occupants?.length || 0,
        }));
        setRooms(formattedRooms);
      } else {
        // Mock data
        setRooms([
          { id: 1, roomNumber: "A101", type: "Standard", capacity: 2, price: 150000, status: "available", floor: 1 },
          { id: 2, roomNumber: "B204", type: "Deluxe", capacity: 2, price: 250000, status: "occupied", floor: 2, occupants: 2 },
          { id: 3, roomNumber: "C315", type: "Suite", capacity: 4, price: 400000, status: "available", floor: 3 },
          { id: 4, roomNumber: "D401", type: "Standard", capacity: 2, price: 150000, status: "maintenance", floor: 4 },
          { id: 5, roomNumber: "E203", type: "Deluxe", capacity: 3, price: 280000, status: "occupied", floor: 2, occupants: 2 },
        ]);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      // Mock data on error
      setRooms([
        { id: 1, roomNumber: "A101", type: "Standard", capacity: 2, price: 150000, status: "available", floor: 1 },
        { id: 2, roomNumber: "B204", type: "Deluxe", capacity: 2, price: 250000, status: "occupied", floor: 2, occupants: 2 },
        { id: 3, roomNumber: "C315", type: "Suite", capacity: 4, price: 400000, status: "available", floor: 3 },
        { id: 4, roomNumber: "D401", type: "Standard", capacity: 2, price: 150000, status: "maintenance", floor: 4 },
        { id: 5, roomNumber: "E203", type: "Deluxe", capacity: 3, price: 280000, status: "occupied", floor: 2, occupants: 2 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "available": return "success";
      case "occupied": return "warning";
      case "maintenance": return "error";
      default: return "info";
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading rooms...</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Room
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Type
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Capacity
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Floor
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Price
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Occupants
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {room.roomNumber}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {room.type}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {room.capacity} {room.capacity === 1 ? "person" : "persons"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    Floor {room.floor}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-theme-sm dark:text-white/90 font-medium">
                    ₦{room.price.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge size="sm" color={getStatusColor(room.status)}>
                      {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {room.occupants !== undefined ? `${room.occupants}/${room.capacity}` : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
