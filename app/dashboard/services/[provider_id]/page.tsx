"use client";

import { useState, useEffect, use } from "react";
import { Container, Button, Form } from "react-bootstrap";
import { useGetAllServices } from "@/services/hooks/serviices/useGetAllServices";
import { serviceType, createNewService } from "@/services/servicesApi/Service.types";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDeleteService } from "@/services/hooks/serviices/useDeleteService";
import { useCreateNewService } from "@/services/hooks/serviices/useCreateNewService";
import { useDebounce } from "@/hooks/useDebounce";
import SafeDeleteModal from "@/components/SafeDeleteModal";
import { toast } from "react-toastify";
import ServicesTable from "./components/ServicesTable";
import EditServiceModal from "./components/EditServiceModal";
import CreateServiceModal from "./components/CreateServiceModal";

export default function ServicesPage({
  params,
}: {
  params: Promise<{ provider_id: string }>;
}) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { provider_id } = use(params);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const limit = 10;
  const { data, isLoading, refetch } = useGetAllServices(provider_id);
  const services = Array.isArray(data) ? data : [];
  
  // Filter services based on search term
  const filteredServices = services.filter((service: serviceType) =>
    service.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    service.user?.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  
  // Data states
  const [selectedService, setSelectedService] = useState<serviceType | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<serviceType | null>(null);
  const [newService, setNewService] = useState<createNewService>({
    provider_id: "",
    title: "",
    duration: 30,
    is_active: true,
    price: 0,
    color: "#4a90e2",
    description: "",
  });

  // API hooks
  const { mutate: deleteMutated } = useDeleteService();
  const { mutate: createMutated } = useCreateNewService();
  const router = useRouter();

  useEffect(() => {
    if (debouncedSearchTerm) {
      setPage(1);
    }
  }, [debouncedSearchTerm]);

  // Handlers
  const handleEdit = (service: serviceType) => {
    setSelectedService(service);
    setShowEditModal(true);
  };

  const handleClose = () => {
    setShowEditModal(false);
    setSelectedService(null);
  };

  const handleNewServiceClose = () => {
    setShowNewServiceModal(false);
    setNewService({
      provider_id: "",
      title: "",
      duration: 30,
      is_active: true,
      price: 0,
      color: "#4a90e2",
      description: "",
    });
  };

  const handleCreateService = () => {
    createMutated(newService, {
      onSuccess: (res: any) => {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["getServices"] });
        refetch();
        handleNewServiceClose();
      },
      onError: (error: any) => {
        toast.error("Fehler beim Erstellen des Dienstes.");
        console.error("Error creating service:", error);
      },
    });
  };

  const handleDeleteClick = (service: serviceType) => {
    setServiceToDelete(service);
    handleClose();
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (serviceToDelete) {
      deleteMutated(serviceToDelete.id, {
        onSuccess: (res: any) => {
          toast.success(res.message);
          queryClient.invalidateQueries({ queryKey: ["getServices"] });
          setServiceToDelete(null);
          setOpenDeleteModal(false);
        },
        onError: (error: any) => {
          toast.error("Dieser Dienst konnte nicht gelöscht werden, da er Termine enthält");
          console.error("Error deleting service:", error);
        }
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Paginate filtered services
  const paginatedServices = filteredServices.slice((page - 1) * limit, page * limit);

  return (
    <>
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4 p-2 shadow">
          <button className="btn btn-outline-primary me-md-2 m-1" onClick={() => router.back()}>
            Zurück
          </button>
          <h2 className="fs-5 fs-md-2 mb-0">Dienstverwaltung</h2>
          <button className="btn btn-outline-primary me-md-2 m-1" onClick={() => setShowNewServiceModal(true)}>
            Neuer Dienst +
          </button>
        </div>
        
        <div className="mb-3 shadow">
          <Form.Control
            type="text"
            placeholder="Suchen nach Titel, Beschreibung oder Anbieter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ServicesTable
          services={paginatedServices}
          isLoading={isLoading}
          page={page}
          limit={limit}
          totalCount={filteredServices.length}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
        />
      </Container>

      <EditServiceModal
        show={showEditModal}
        onHide={() => {
          handleClose();
          // Refetch services after closing the edit modal to ensure latest data
          refetch();
        }}
        service={selectedService}
        onDelete={handleDeleteClick}
      />

      <CreateServiceModal
        show={showNewServiceModal}
        onHide={handleNewServiceClose}
        newService={newService}
        onServiceChange={setNewService}
        onCreate={handleCreateService}
      />

      <SafeDeleteModal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Dienst löschen"
        message="Sind Sie sicher, dass Sie diesen Dienst löschen möchten?"
        confirmText="Löschen"
        cancelText="Abbrechen"
      />
    </>
  );
}

export type { serviceType }; 