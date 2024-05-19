import React from "react";
import { getStatusColor } from "../../../Helper";
import { cartItemModel } from "../../../Interfaces";
import { orderSummaryProps } from "./orderSummaryProps";
import { useNavigate } from "react-router-dom";
import { SD_Roles, SD_Status } from "../../../Utility/SD";
import { RootState } from "../../../Storage/Redux/store";
import { useSelector } from "react-redux";
import { useState } from "react";

import { useUpdateOrderHeaderMutation } from "../../../Apis/orderApi";
import { MainLoader } from "../Common";
import LoyalityCart from "../Cart/LoyalityCart";

function OrderSummary({ data, userInput }: orderSummaryProps) {
  const badgeTypeColor = getStatusColor(data.status!);
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.userAuthStore);
  const [loading, setIsLoading] = useState(false);

  //loyality cartvalue//
  let toloyalityval = 0;
  const [includeLoyalty, setIncludeLoyalty] = useState(false);

  const handleIncludeLoyalty = (loyaltyIncluded: boolean) => {
    setIncludeLoyalty(loyaltyIncluded);
  };

  ////end code

  const [updateOrderHeader] = useUpdateOrderHeaderMutation();
  const nextStatus: any =
    data.status! === SD_Status.CONFIRMED
      ? { color: "info", value: SD_Status.BEING_COOKED }
      : data.status! === SD_Status.BEING_COOKED
      ? { color: "warning", value: SD_Status.READY_FOR_PICKUP }
      : data.status! === SD_Status.READY_FOR_PICKUP && {
          color: "success",
          value: SD_Status.COMPLETED,
        };

  const handleNextStatus = async () => {
    setIsLoading(true);
    await updateOrderHeader({
      orderHeaderId: data.id,
      status: nextStatus.value,
    });

    setIsLoading(false);
  };

  const handleCancel = async () => {
    setIsLoading(true);
    await updateOrderHeader({
      orderHeaderId: data.id,
      status: SD_Status.CANCELLED,
    });
    setIsLoading(false);
  };
  ////loyality value sum start
  // // Function to calculate total including loyalty discount
  // function calculateTotal(data: any) {
  //   let total = parseFloat(data.cartTotal ?? "0"); // Initialize total with cartTotal

  //   if (includeLoyalty) {
  //     total -= 5; // Deduct $5 loyalty discount
  //   }

  //   return total.toFixed(2); // Return the total with two decimal places
  // }

  //end

  // Function to calculate total including loyalty discount and additional $20 discount
  function calculateTotal(data: any) {
    // console.log(data.cartTotal);
    let total = parseFloat(data.cartTotal ?? "0"); // Initialize total with cartTotal
    // console.log(total + "bhagy");
    // Apply $5 loyalty discount if includeLoyalty is true
    if (includeLoyalty) {
      total -= 5; // Deduct $5 loyalty discount
    }

    // Apply additional $20 discount
  //  total -= 20; // Deduct $20 discount

    // Ensure total doesn't go below zero
    if (total < 0) {
      total = 0;
    }

    return total.toFixed(2); // Return the total with two decimal places
  }

  return (
    <div>
      {loading && <MainLoader />}
      {!loading && (
        <>
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="text-success">Order Summary</h3>
            <span className={`btn btn-outline-${badgeTypeColor} fs-6`}>
              {data.status}
            </span>
          </div>
          <div className="mt-3">
            <div className="border py-3 px-2">
              Customer Name : {userInput.name}
            </div>
            <div className="border py-3 px-2">Email : {userInput.email}</div>
            <div className="border py-3 px-2">
              Phone : {userInput.phoneNumber}
            </div>
            <div className="border py-3 px-2">
              <LoyalityCart onIncludeLoyalty={setIncludeLoyalty} />
            </div>
            <div className="border py-3 px-2">
              <h4 className="text-success">Menu Items</h4>
              <div className="p-3">
                {data.cartItems?.map(
                  (cartItem: cartItemModel, index: number) => {
                    return (
                      <div className="d-flex" key={index}>
                        <div className="d-flex w-100 justify-content-between">
                          <p>{cartItem.menuItem?.name}</p>

                          <p>
                            ${cartItem.menuItem?.price} x {cartItem.quantity} =
                          </p>
                        </div>
                        <p style={{ width: "70px", textAlign: "right" }}>
                          $
                          {(cartItem.menuItem?.price ?? 0) *
                            (cartItem.quantity ?? 0)}
                        </p>
                      </div>
                    );
                  }
                )}

                <hr />
                <h4 className="text-danger" style={{ textAlign: "right" }}>
                  ${calculateTotal(data)}
                </h4>
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              Back to Orders
            </button>
            {userData.role !== SD_Roles.ADMIN && (
              <div className="d-flex">
                {data.status! !== SD_Status.CANCELLED &&
                  data.status! !== SD_Status.COMPLETED && (
                    <button
                      className="btn btn-danger mx-2"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  )}

                <button
                  className={`btn btn-${nextStatus.color}`}
                  onClick={handleNextStatus}
                >
                  {nextStatus.value}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default OrderSummary;
