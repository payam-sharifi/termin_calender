"use client";

import { Table, Button } from "react-bootstrap";
import Link from "next/link";
import { UserRsDataType, ROLE, SEX } from "@/services/userApi/user.types";

interface UsersTableProps {
  users: UserRsDataType[];
  isLoading: boolean;
  page: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  onEdit: (user: UserRsDataType) => void;
}

export default function UsersTable({
  users,
  isLoading,
  page,
  limit,
  onPageChange,
  onEdit,
}: UsersTableProps) {
  if (isLoading) {
    return <div>Laden...</div>;
  }

  return (
    <>
      <div className="shadow">
        <Table striped bordered hover responsive style={{ marginBottom: 0 }}>
          <thead>
            <tr>
              <th style={{ width: '8%' }}>Name</th>
              <th style={{ width: '10%' }}>Familienname</th>
              <th style={{ width: '16%' }}>E-Mail</th>
              <th style={{ width: '12%' }}>Telefon</th>
              <th style={{ width: '8%' }}>Geschlecht</th>
              <th style={{ width: '3%' }}>Verifiziert</th>
              <th style={{ width: '10%' }}>Rolle</th>
              <th style={{ width: '8%' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user: UserRsDataType) => (
              <tr key={user.id}>
                <td style={{ width: '8%' }}>
                  <Link href={`/dashboard/users/${user.id}`} style={{ textDecoration: 'none' }}>
                    {user.name}
                  </Link>
                </td>
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
                    onClick={() => onEdit(user)}
                  >
                    Bearbeiten
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="d-flex justify-content-center align-items-center mt-3">
        <Button
          variant="secondary"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Prev
        </Button>
        <span className="mx-3">Page {page}</span>
        <Button
          variant="secondary"
          onClick={() => onPageChange(users.length < limit ? page : page + 1)}
          disabled={users.length < limit}
        >
          Next
        </Button>
      </div>
    </>
  );
} 