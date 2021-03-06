/* This example requires Tailwind CSS v2.0+ */
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import FormInput from "../components/formInput";

export default function RepayModal({
  onApprove,
  onRepay,
  onCancel,
  lendingPoolAllowance,
}) {
  const [open, setOpen] = useState(true);
  const [showApprove, setShowApprove] = useState(true);

  const cancelButtonRef = useRef(null);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const subscription = watch((value) => {
      if (parseInt(value.amount) > parseInt(lendingPoolAllowance)) {
        setShowApprove(true);
      } else {
        setShowApprove(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = useCallback(
    (data) => {
      const amount = data.amount;
      if (!amount) {
        console.log("No amount given, received:", amount);
        return;
      }
      if (showApprove) {
        onApprove(amount);
      } else {
        setOpen(false);

        onRepay(amount);
      }
    },
    [showApprove],
  );

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="font-teletactile text-lg leading-6 font-medium text-gray-100"
                    >
                      How much do you want to repay?
                    </Dialog.Title>
                    <div className="mt-2 flex flex-column justify-center items-center font-teletactile">
                      <div className="mt-2 text-gray-50 text-sm">{`Current contract allowance: ${lendingPoolAllowance}`}</div>
                      <FormInput
                        register={register}
                        error={errors.amount}
                        inputName="amount"
                        type="number"
                        placeholder={0}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center glowing-button-pink uppercase"
                    onClick={() => {
                      setOpen(false);
                      onCancel();
                    }}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center glowing-button-blue uppercase"
                  >
                    {showApprove ? "Approve" : "Repay"}
                  </button>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
