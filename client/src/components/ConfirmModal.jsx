import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm'
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className='bg-white w-full max-w-md p-6 rounded-xl relative shadow-xl'
          >
            <button
              className='absolute top-4 right-4 text-xl text-gray-500 hover:text-gray-700'
              onClick={onCancel}
              aria-label='Close'
            >
              <IoClose />
            </button>

            <h2 className='text-xl font-semibold text-center mb-4'>{title}</h2>
            <p className='text-sm text-center text-slate-600 mb-6'>{message}</p>

            <div className='flex justify-between gap-4'>
              <button
                onClick={onCancel}
                className='text-slate-600 hover:text-slate-800 font-semibold'
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className='button-hover bg-brand-tertiary text-brand-main'
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
