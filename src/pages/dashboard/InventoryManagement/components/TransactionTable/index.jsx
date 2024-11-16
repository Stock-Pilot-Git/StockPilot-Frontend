import { PencilIcon } from "@heroicons/react/24/solid";
import {
  ArrowDownTrayIcon,
  DocumentArrowUpIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
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
  Tooltip,
  Input,
  Dialog,
  DialogBody,
  DialogHeader,
  DialogFooter,
  Option,
  Select,
} from "@material-tailwind/react";
import { usePDF } from 'react-to-pdf';
import { useState, useEffect } from "react";
import { getDataTransaction } from "@/services/inventory/transaction";
const TABLE_HEAD = [ "Transaction Date", "Product", "Quantity", "Stock", "Transaction Type", "Supplier/Retailer"];
 
const ITEMS_PER_PAGE = 5 

export function TransactionTable() {

  const { toPDF, targetRef } = usePDF({filename: 'Transaction.pdf'});

  // GET DATA TRANSACTION
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

  const filteredData = dataList.filter((transaction) => 
    transaction.product.name.toLowerCase().includes(searchQuery.toLowerCase())
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
  
  const handleInitialData= () => {

    getDataTransaction()
    .then(reponse => setData(reponse))
    .catch(error => console.error("There was an error!", error));

  }
  useEffect(() => {
    handleInitialData()
  }, []);



  return (
    <>
      <Card className="h-full w-full">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <Typography variant="h5" color="blue-gray">
                Transaction
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
            </div>

            <Button value="export" onClick={() => toPDF()} className="flex items-center mr-8 gap-3 bg-blue" size="sm">
              <DocumentArrowUpIcon strokeWidth={2} className="h-4 w-4" /> Export
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
                currentData.map((transaction, index) => {
                const isLast = index === currentData.length - 1;
                const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={transaction.id}>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {transaction.product.name}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {transaction.quantity}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {transaction.stockAfterTransaction}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {transaction.movementType}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {transaction.movementType === "OUTBOUND" 
                            ? transaction.retailer?.name || "N/A" 
                            : transaction.supplier?.name || "N/A"}
                        </Typography>
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

 

    </>
  );
}

export default TransactionTable;