import { 
  PencilIcon,   
  XCircleIcon,
  CheckCircleIcon} from "@heroicons/react/24/solid";
import React from "react";
import {
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";

import { 
  ChevronRightIcon, 
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardHeader,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Avatar,
  IconButton,
  Option,
  Select,
  Tooltip,
  Input,
  Dialog,
  DialogBody,
  DialogHeader,
  DialogFooter,
} from "@material-tailwind/react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { usePDF } from 'react-to-pdf';
import { useState, useEffect } from "react";
import { getDataDelivery, postDataDelivery, updateDeliveryStatus } from "@/services/inventory/delivery";
import DeliveryDialog from "./DeliveryDialog";
import { AlertDelivery } from "./AlertDelivery";
 
const TABLE_HEAD = ["Delivery Date", "Delivery Date", "Product", "Quantity", "Retailer", "Status", "Action"];
 
const ITEMS_PER_PAGE = 5 
 
export function DeliveryTable() {

  // GET DATA DELIVERY

  const { toPDF, targetRef } = usePDF({filename: 'Delivery.pdf'});

  // GET DELIVERY DATA
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false); // Untuk kontrol alert
    
  const [dataList, setData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(dataList.length / ITEMS_PER_PAGE);

  // SEARCH
  const [searchQuery, setSearchQuery] = useState("");

  // Fungsi untuk menangani perubahan input search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredData = dataList.filter((delivery) => 

    delivery.items[0].product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const [openFilter, setOpenFilter] = useState(false);
  const handleOpenFilter = () => setOpenFilter(!openFilter);

  const handleInitialData= () => {

    getDataDelivery()
    .then(reponse => setData(reponse))
    .catch(error => console.error("There was an error!", error));

  }
  useEffect(() => {
    handleInitialData()
  }, []);



  // ADD DELIVERY
  const [openDeliveryDialog, setOpenDeliveryDialog] = useState(false);

  const handleOpenDeliveryDialog = () => setOpenDeliveryDialog(true);

  const handleCloseDeliveryDialog = () => setOpenDeliveryDialog(false);

  const handleAdd = async (formData) =>{
    try {
      const response = await postDataDelivery(formData);
      console.log('Data posted successfully:', response);

      setShowAlert(true);
      setMessage("Berhasil menambahkan Delivery");
      setTimeout(() => setShowAlert(false), 2000);
      handleCloseDeliveryDialog();
      handleInitialData();
      // Tambahkan aksi setelah berhasil mengirim data, seperti mengupdate state atau mengarahkan ke halaman lain
    } catch (error) {
      setMessage("Gagal menambahkan Delivery");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
      console.error('Failed to post data:', error);
    }
  }

  // RECIEVED AND CANCELLED

  const handleStatusUpdate = async (deliveryId, newStatus) => {
    try {
      const response = await updateDeliveryStatus(deliveryId, newStatus);
      console.log(`Order ${deliveryId} updated successfully:`, response);
  
      // Update pesan notifikasi
      setMessage(`Order ${deliveryId} updated to ${newStatus}`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
  
      // Refresh data dari backend
      handleInitialData();
    } catch (error) {
      setMessage(`Failed to update order ${deliveryId}`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };


  
  return (
    <>
      <Card className="h-full w-full">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <Typography variant="h5" color="blue-gray">
                Delivery
              </Typography>
            </div>
          </div>
        </CardHeader>
        <div className="ml-4">
          <div className="flex w-full justify-between gap-4">
              {/* Bagian Kiri: Search dan Filter */}
            <div className="flex w-full md:w-max gap-4">
              <div className="w-full md:w-72">
                  <Input
                  label="Search"
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  onChange={handleSearchChange}
                  value={searchQuery} 
                  />
              </div>
              <Button value="export" onClick={() => toPDF()} className="flex items-center gap-3 bg-blue" size="sm">
                  <DocumentArrowUpIcon strokeWidth={2} className="h-4 w-4" /> Export
              </Button>
            </div>

            <Button value="newdelivery" onClick={handleOpenDeliveryDialog} className="flex items-center mr-6 gap- bg-blue" size="sm">
              <PlusIcon strokeWidth={2} className="h-4 w-4" /> New Delivery
            </Button>
          </div>
        </div>
        <CardBody className="overflow-scroll px-0" ref={targetRef}>
          <table className="w-full min-w-max table-auto text-center">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal leading-none opacity-70"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                  currentData.map((delivery, index) => {
                  const isLast = index === currentData.length - 1;
                  const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                  const item = delivery.items[0]; // Ambil item pertama (jika ada)
                  const productName = item?.product?.name || "N/A"; // Nama produk
                  const quantity = item?.quantity || 0; // Kuantitas produk

                  return (
                    <tr key={delivery.id}>
                      <td className={classes}>
                        <div className="gap-3">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {new Date(delivery.createdAt).toLocaleDateString()}
                          </Typography>
                        </div>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {new Date(delivery.updatedAt).toLocaleDateString()}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {productName}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {quantity}
                        </Typography>
                      </td>
                      <td className={classes}>
                          <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                          >
                            {/* {delivery.retailer.name} */}
                          </Typography>
                      </td>
                      <td className={classes}>
                          <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                          >
                              {delivery.status}
                          </Typography>
                      </td>
                      <td className={classes}>
                      <Tooltip content="Edit User">
                          <IconButton variant="text" onClick={() => handleStatusUpdate(delivery.id, "Cancelled")}>
                            <XCircleIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip content="Edit User">
                          <IconButton variant="text" onClick={() => handleStatusUpdate(delivery.id, "Completed")}>
                            <CheckCircleIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                <td colSpan="6" className="p-4 text-center text-blue-gray-500">
                    <Typography variant="h6" color="blue-gray">
                        No Data Here
                    </Typography>
                    <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70 mt-4">
                        Create your first data
                    </Typography>
                </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <Button variant="outlined" size="sm" onClick={handlePrevious} disabled={currentPage === 1}>
              Previous
            </Button>
              <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, index) => (
                  <IconButton
                    key={index}
                    variant={currentPage === index + 1 ? "outlined" : "text"}
                    size="sm"
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </IconButton>
                ))}
              </div>
            <Button variant="outlined" size="sm"onClick={handleNext} disabled={currentPage === totalPages}>
              Next
            </Button>
        </CardFooter>
      </Card>


      {/* ALERT */ }
      <AlertDelivery show={showAlert} InputText={message} />

      {/* ADD Delivery */ }
      <DeliveryDialog open={openDeliveryDialog} handleAdd = {handleAdd} handleClose = {handleCloseDeliveryDialog}/>

    </>
  );
}

export default DeliveryTable;