"use client";

import { useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useGetUsers } from "@/services/hooks/user/useGetUsers";
import { ROLE, SEX, UserRsDataType, CreateUserRqDataType } from "@/services/userApi/user.types";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDeleteUserById } from "@/services/hooks/user/useDeleteUserById";
import { useCreateUser } from "@/services/hooks/user/useCreateUser";
import SafeDeleteModal from "@/app/mycalender/components/SafeDeleteModal";
import { toast } from "react-toastify";
import UsersTable from "./components/UsersTable";
import EditUserModal from "./components/EditUserModal";
import CreateUserModal from "./components/CreateUserModal";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading } = useGetUsers(undefined, limit, page);
  const users = data?.data || [];
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  
  // Data states
  const [selectedUser, setSelectedUser] = useState<UserRsDataType | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserRsDataType | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    family: "",
    email: "",
    phone: "",
    sex: "",
    role: "",
    is_verified: false,
    password: "",
  });

  // API hooks
  const { mutate: deleteMutated } = useDeleteUserById();
  const { mutate: createMutated } = useCreateUser();
  const router = useRouter();

  // Handlers
  const handleEdit = (user: UserRsDataType) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleClose = () => {
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleNewUserClose = () => {
    setShowNewUserModal(false);
    setNewUser({
      name: "",
      family: "",
      email: "",
      phone: "",
      sex: "",
      role: "",
      is_verified: false,
      password: "",
    });
  };

  const handleCreateUser = () => {
    const payload = {
      ...newUser,
      sex: newUser.sex as SEX,
      role: newUser.role as ROLE,
    };

    createMutated(payload, {
      onSuccess: (res: any) => {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["users"] });
        handleNewUserClose();
      },
      onError: (error: any) => {
       
        toast.error("Möglicherweise gibt es einen Kunden mit dieser E-Mail-Adresse oder Nummer.");
        console.error("Error creating user:", error);
      },
    });
  };

  const handleDeleteClick = (user: UserRsDataType) => {
    setUserToDelete(user);
    handleClose();
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteMutated({ id: userToDelete.id }, {
        onSuccess: (res: any) => {
          toast.success(res.message);
          queryClient.invalidateQueries({ queryKey: ["users"] });
          setUserToDelete(null);
          setOpenDeleteModal(false);
        },
        onError: (error: any) => {
          toast.error(error.message);
          console.error("Error deleting user:", error);
        }
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <>
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4" style={{
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: 'white',
          marginBottom: '24px'
        }}>
          <div>
            <button className="btn btn-outline-warning me-2" onClick={() => router.back()}>
              &larr; Zurück zu Services
            </button>
          </div>
          <h2>Benutzerverwaltung</h2>
          <button className="btn btn-outline-warning me-2"onClick={() => setShowNewUserModal(true)}>
            Neuer Benutzer
          </button>
        </div>
        
        <UsersTable
          users={users}
          isLoading={isLoading}
          page={page}
          limit={limit}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
        />
      </Container>

      <EditUserModal
        show={showEditModal}
        onHide={handleClose}
        user={selectedUser}
        onDelete={handleDeleteClick}
      />

      <CreateUserModal
        show={showNewUserModal}
        onHide={handleNewUserClose}
        newUser={newUser}
        onUserChange={setNewUser}
        onCreate={handleCreateUser}
      />

      <SafeDeleteModal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Benutzer löschen"
        message="Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?"
        confirmText="Löschen"
        cancelText="Abbrechen"
      />
    </>
  );
}

export type { UserRsDataType }; 