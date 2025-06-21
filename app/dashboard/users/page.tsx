"use client";

import { useState, useEffect } from "react";
import { Container, Button, Form } from "react-bootstrap";
import { useGetUsers } from "@/services/hooks/user/useGetUsers";
import { ROLE, SEX, UserRsDataType, CreateUserRqDataType } from "@/services/userApi/user.types";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDeleteUserById } from "@/services/hooks/user/useDeleteUserById";
import { useCreateUser } from "@/services/hooks/user/useCreateUser";
import { useDebounce } from "@/hooks/useDebounce";
import SafeDeleteModal from "@/app/components/SafeDeleteModal";
import { toast } from "react-toastify";
import UsersTable from "../../components/users/UsersTable";
import EditUserModal from "../../components/users/EditUserModal";
import CreateUserModal from "../../components/users/CreateUserModal";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const limit = 10;
  const { data, isLoading } = useGetUsers(debouncedSearchTerm, limit, page);
  const users = data?.data || [];
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  
  // Data states
  const [selectedUser, setSelectedUser] = useState<UserRsDataType | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserRsDataType | null>(null);
  const [newUser, setNewUser] = useState<Omit<CreateUserRqDataType, "role" | "sex"> & { role: string; sex: string }>({
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

  useEffect(() => {
    if (debouncedSearchTerm) {
      setPage(1);
    }
  }, [debouncedSearchTerm]);

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
        <div className="d-flex justify-content-between align-items-center mb-4 p-2 shadow" >
         
            <button className="btn btn-outline-primary me-md-2 m-1" onClick={() => router.back()}>
              Zurück
            </button>
          
          <h2 className="fs-5 fs-md-2 mb-0">Benutzerverwaltung</h2>
          <button className="btn  btn-outline-primary me-md-2 m-1" onClick={() => setShowNewUserModal(true)}>
            Neuer +
          </button>
        </div>
        
        <div className="mb-3 shadow" >
          <Form.Control
            type="text"
            placeholder="Suchen nach Name, E-Mail oder Telefon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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