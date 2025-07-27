import { useQuery } from "@tanstack/react-query";
import { getAllUser } from "../../userApi";
import { ROLE } from "../../userApi/user.types";

export const useGetProvidersAndAdmins = () => {
  return useQuery({
    queryKey: ["providers-and-admins"],
    queryFn: async () => {
      // Fetch all users without pagination to get providers and admins
      const response = await getAllUser("", 1000, 1); // Large limit to get all users
      const allUsers = response.data || [];
      
      // Filter for providers and admins
      const providersAndAdmins = allUsers.filter(user => 
        user.role === ROLE.Provider || user.role === ROLE.Admin
      );
      
      return providersAndAdmins;
    },
  });
}; 