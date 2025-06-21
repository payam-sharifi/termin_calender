"use client";

import { useEffect, useState } from "react";
import { Table, Container, Button, Modal, Form } from "react-bootstrap";
import { useGetUsers } from "@/services/hooks/user/useGetUsers";
import { ROLE, SEX, UserRsDataType, CreateUserRqDataType } from "@/services/userApi/user.types";
import { createUser } from "@/services/userApi";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDeleteUserById } from "@/services/hooks/user/useDeleteUserById";
import SafeDeleteModal from "@/app/mycalender/components/SafeDeleteModal";
import { toast } from "react-toastify";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, refetch } = useGetUsers(undefined, limit, page);
  const users = data?.data || [];
  const [showEditModal, setShowEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<UserRsDataType | null>(null);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRsDataType | null>(null);
  const {mutate:deleteMutated}=useDeleteUserById()
  const router=useRouter()
  const [newUser, setNewUser] = useState<CreateUserRqDataType>({
    name: "",
    family: "",
    email: "",
    phone: "",
    sex: SEX.male,
    role: ROLE.Customer,
    is_verified: false,
    password: "",
  });


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
      sex: SEX.male,
      role: ROLE.Customer,
      is_verified: false,
      password: "",
    });
  };

  const handleCreateUser = async () => {
    try {
      await createUser(newUser);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      handleNewUserClose();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleDeleteClick = (user: UserRsDataType) => {
    setUserToDelete(user);
    handleClose()
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteMutated({ id: userToDelete.id }, {
        onSuccess: (res:any) => {
        toast.success(res.message)
          queryClient.invalidateQueries({ queryKey: ["users"] });
          setUserToDelete(null);
          setOpenDeleteModal(false);
        },
        onError: (error: any) => {
          toast.error(error.message)
          console.error("Error deleting user:", error);
        }
      });
    }
  };

  return (
    <>
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => router.back()}>
            &larr; Zurück zu Services
          </button>
        </div>
        <h2>Benutzerverwaltung</h2>
        <Button variant="primary" onClick={() => setShowNewUserModal(true)}>
          Neuer Benutzer
        </Button>
      </div>
      
      {isLoading ? (
        <div>Laden...</div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th style={{ width: '8%' }}>Name</th>
                <th style={{ width: '10%' }}>Familienname</th>
                <th style={{ width: '16%' }}>E-Mail</th>
                <th style={{ width: '12%' }}>Telefon</th>
                <th style={{ width: '8%' }}>Geschlecht</th>
                <th style={{ width: '8%' }}>Verifiziert</th>
                <th style={{ width: '10%' }}>Rolle</th>
                <th style={{ width: '8%' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user: UserRsDataType) => (
                <tr key={user.id}>
                  <td style={{ width: '8%' }}>{user.name}</td>
                  <td style={{ width: '10%' }}>{user.family}</td>
                  <td style={{ width: '16%' }}>{user.email}</td>
                  <td style={{ width: '12%' }}>{user.phone}</td>
                  <td style={{ width: '8%' }}>{user.sex === SEX.male ? "Männlich" : "Weiblich"}</td>
                  <td style={{ width: '3%' }}>{user.is_verified ? "Ja" : "Nein"}</td>
                  <td style={{ width: '10%' }}>{user.role}</td>
                  <td style={{ width: '8%' }}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      Bearbeiten
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <span>Page {page}</span>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => (users.length < limit ? p : p + 1))}
              disabled={users.length < limit}
            >
              Next
            </Button>
          </div>
        </>
      )}

      <Modal show={showEditModal} onHide={handleClose} size="sm" centered
       dialogClassName="modal-50w"
      >
            <style jsx global>{`
          .modal-50w {
            max-width: 40% !important;
            width: 40% !important;
          }
        `}</style>
        <Modal.Header closeButton>
          <Modal.Title>Benutzer bearbeiten</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form>
              <Form.Group className="mb-1">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={selectedUser.name}
                />
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>Familienname</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={selectedUser.family}
                />
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>E-Mail</Form.Label>
                <Form.Control
                  type="email"
                  defaultValue={selectedUser.email}
                />
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>Telefon</Form.Label>
                <Form.Control
                  type="tel"
                  defaultValue={selectedUser.phone}
                />
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>Geschlecht</Form.Label>
                <Form.Select defaultValue={selectedUser.sex}>
                  <option value={SEX.male}>Männlich</option>
                  <option value={SEX.female}>Weiblich</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>Rolle</Form.Label>
                <Form.Select defaultValue={selectedUser.role}>
                  <option value={ROLE.Customer}>Kunde</option>
                  <option value={ROLE.Provider}>Anbieter</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Check
                  type="checkbox"
                  label="Verifiziert"
                  defaultChecked={selectedUser.is_verified}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex align-items-center justify-content-between">
        <Button variant="danger" onClick={() => {
          if (selectedUser) {
            handleDeleteClick(selectedUser);
          }
        }}>
          Löschen
        </Button>
          <div className="d-flex align-items-center ">
          <Button variant="secondary" onClick={handleClose}>
            Abbrechen
          </Button>
          <Button variant="primary" className="mx-2" onClick={handleClose}>
            Speichern
          </Button>
          </div>
        </Modal.Footer>
      </Modal>

      <Modal 
        show={showNewUserModal} 
        onHide={handleNewUserClose} 
        size="sm" 
        centered
        dialogClassName="modal-50w"
      >
        <style jsx global>{`
          .modal-50w {
            max-width: 40% !important;
            width: 40% !important;
          }
        `}</style>
        <Modal.Header closeButton>
          <Modal.Title>Neuer Benutzer</Modal.Title>
        </Modal.Header>
        <Modal.Body >
          <Form>
            <Form.Group className="mb-1">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label>Familienname</Form.Label>
              <Form.Control
           
                type="text"
                value={newUser.family}
                onChange={(e) => setNewUser({ ...newUser, family: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label>E-Mail</Form.Label>
              <Form.Control
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label>Telefon</Form.Label>
              <Form.Control
                type="tel"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label>Passwort</Form.Label>
              <Form.Control
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          
              />
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label>Geschlecht</Form.Label>
              <Form.Select
                value={newUser.sex}
                onChange={(e) => setNewUser({ ...newUser, sex: e.target.value as unknown as SEX })}
              >
                <option value={SEX.male}>Männlich</option>
                <option value={SEX.female}>Weiblich</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label>Rolle</Form.Label>
              <Form.Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as unknown as ROLE })}
              >
                <option value={ROLE.Customer}>Kunde</option>
                <option value={ROLE.Provider}>Anbieter</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Check
                type="checkbox"
                label="Verifiziert"
                checked={newUser.is_verified}
                onChange={(e) => setNewUser({ ...newUser, is_verified: e.target.checked })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="d-flex align-items-center justify-content-between">
        <Button variant="danger"  onClick={()=>console.log("delete kunde")}>
            Speichern
          </Button>
          <div className="d-flex align-items-center ">
          <Button variant="secondary" onClick={handleNewUserClose}>
            Abbrechen
          </Button>
          <Button variant="primary" className="mx-2" onClick={handleCreateUser}>
            Erstellen
          </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </Container>
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

export { createUser };
export type { UserRsDataType }; 