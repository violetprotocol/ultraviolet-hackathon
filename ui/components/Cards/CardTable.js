import PropTypes from "prop-types";
import React, { useState } from "react";
import DoxxModal from "../DoxxModal";

export default function CardTable({ color, loans, buttonText, onButtonClick, isFetching, isTxPending, isLender=false }) {
  const [openDoxxModal, setOpenDoxxModal] = useState(false);
  const [doxxedLoan, setDoxxedLoan] = useState();

  const handleClick = async (loan) => {
    if (isLender) {
      setDoxxedLoan(loan);
      onButtonClick(loan.borrower, setOpenDoxxModal, true);
    }
    else onButtonClick();
  }

  return (
    <>
      <div
        className={
          "relative flex flex-col min-w-0 break-words w-full shadow-lg rounded bg-transparent text-zinc-100" 
        }
      >
        <div className="block w-full overflow-x-auto">
          {/* Projects table */}
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-center " +
                    (color === "dark"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-blueGray-600 text-blueGray-200 border-blueGray-500")
                  }
                >
                  Index
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-center " +
                    (color === "dark"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-blueGray-600 text-blueGray-200 border-blueGray-500")
                  }
                >
                  Total Amount Due
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-center " +
                    (color === "dark"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-blueGray-600 text-blueGray-200 border-blueGray-500")
                  }
                >
                  Status
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-center " +
                    (color === "dark"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-blueGray-600 text-blueGray-200 border-blueGray-500")
                  }
                >
                  Maturity
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-center " +
                    (color === "dark"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-blueGray-600 text-blueGray-200 border-blueGray-500")
                  }
                >
                  Token ID
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-center " +
                    (color === "dark"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-blueGray-600 text-blueGray-200 border-blueGray-500")
                  }
                ></th>
              </tr>
            </thead>
            <tbody>
              {isFetching && 
                <tr className="w-full flex justify-center">
                  <td className="text-center mx-auto">Fetching...</td>
                </tr>
              }
              {!isFetching && loans.length === 0 &&  
                
                <tr className="w-full flex justify-center p-2">
                  <td className="text-center mx-auto">No open loans</td>
                </tr>
              }
              {!isFetching && loans.length > 0 && loans.map(loan => <tr key={loan.tokenId} >
               <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                  <span
                    className={
                      "ml-3 font-bold " +
                      +(color === "dark" ? "text-blueGray-600" : "text-white")
                    }
                  >
                    0
                  </span>
                </th>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  <div className="text-center">{loan?.totalAmountDue?.toString()}</div>
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  {loan.defaulted ? <div><i className="fas fa-circle text-red-500 mr-2"></i> default</div>
                    : loan?.totalAmountDue?.toString() === "0.0" ? <div><i className="fas fa-circle text-green-500 mr-2"></i> completed </div>
                    : <div><i className="fas fa-circle text-yellow-500 mr-2"></i> active</div>} 
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  <div className="flex">
                    {new Date(loan.maturity * 1000).toLocaleString()}
                  </div>
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  <div className="flex items-center">
                    <span className="mx-auto">{loan.tokenId}</span>
                  </div>
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                  {!isLender && loan.defaulted 
                    ?  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200 uppercase last:mr-0 mr-1">
                        {'\u2620'}  Rekt  {'\u2620'}
                      </span>
                    : loan?.totalAmountDue?.toString() === "0.0"
                      ? <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-200 uppercase last:mr-0 mr-1">
                        {'\u2696'}  Paid  {'\u2696'}
                      </span>
                      : (!isLender || (isLender && loan.maturity < Date.now()/1000)) && 
                    <button onClick={() => {isLender? handleClick(loan) : handleClick()}} type="submit" className="glowing-button-pink uppercase my-8">
                      {isTxPending ? buttonText.pending : (!isLender && loan.defaulted) ? "rekt" : buttonText.default}
                    </button>
                  }
                </td>
              </tr>
              )}
            </tbody>
          </table>
          {isLender && openDoxxModal && <DoxxModal nftId={doxxedLoan?.tokenId} open={openDoxxModal} setOpen={setOpenDoxxModal}/>}
        </div>
      </div>
    </>
  );
}

CardTable.defaultProps = {
  color: "light",
};

CardTable.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
};
