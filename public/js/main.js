// Main JavaScript for AquaCulture Admin Panel

// Utility functions
const utils = {
    formatDate: (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },
    
    showToast: (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
            type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
        } text-white`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    },
    
    confirmAction: (message) => {
        return confirm(message);
    }
};

// Modal functions
const modal = {
    open: (modalId) => {
        const modalEl = document.getElementById(modalId);
        if (modalEl) {
            modalEl.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    },
    
    close: (modalId) => {
        const modalEl = document.getElementById(modalId);
        if (modalEl) {
            modalEl.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }
};

// Close modal on backdrop click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        const modal = e.target.closest('.modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }
});

// Table filtering
const initTableFilter = (tableId, inputId) => {
    const input = document.getElementById(inputId);
    const table = document.getElementById(tableId);
    
    if (input && table) {
        input.addEventListener('keyup', (e) => {
            const filter = e.target.value.toLowerCase();
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(filter) ? '' : 'none';
            });
        });
    }
};

// Form validation
const validateForm = (formId) => {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('border-red-500');
        } else {
            field.classList.remove('border-red-500');
        }
    });
    
    return isValid;
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize tooltips if needed
    // Initialize date pickers if needed
    // Initialize other common functionality
});

// Export for use in other scripts
window.utils = utils;
window.modal = modal;

