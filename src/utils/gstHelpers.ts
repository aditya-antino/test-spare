/**
 * Helper functions for GST display logic
 * 
 * For UI display purposes:
 * - If state is Delhi (case-insensitive): Show CGST and SGST separately
 * - If state is NOT Delhi: Show IGST (combined CGST + SGST)
 * 
 * Note: This is ONLY for UI display. The actual payload sent to backend
 * should always contain separate CGST and SGST values.
 */

export interface GSTDisplayData {
    showAsIGST: boolean;
    cgst: number;
    sgst: number;
    igst: number; // Combined CGST + SGST for display
}

/**
 * Determines how GST should be displayed based on the state
 * @param state - The state name from the space data
 * @param cgstAmount - CGST amount
 * @param sgstAmount - SGST amount
 * @returns Object containing display logic and amounts
 */
export function getGSTDisplayData(
    state: string | undefined,
    cgstAmount: number | string,
    sgstAmount: number | string
): GSTDisplayData {
    const cgst = typeof cgstAmount === 'string' ? parseFloat(cgstAmount) || 0 : cgstAmount || 0;
    const sgst = typeof sgstAmount === 'string' ? parseFloat(sgstAmount) || 0 : sgstAmount || 0;
    
    // Check if state is Delhi (case-insensitive)
    const isDelhi = state?.toLowerCase().trim() === 'delhi' || 
                    state?.toLowerCase().trim() === 'new delhi';
    
    return {
        showAsIGST: !isDelhi, // Show as IGST if NOT Delhi
        cgst,
        sgst,
        igst: cgst + sgst, // Combined for IGST display
    };
}

/**
 * Formats GST for display in UI
 * @param state - The state name
 * @param cgstAmount - CGST amount
 * @param sgstAmount - SGST amount
 * @returns Array of GST line items to display
 */
export function formatGSTForDisplay(
    state: string | undefined,
    cgstAmount: number | string,
    sgstAmount: number | string
): Array<{ label: string; amount: number }> {
    const gstData = getGSTDisplayData(state, cgstAmount, sgstAmount);
    
    if (gstData.showAsIGST) {
        // Show as IGST for non-Delhi states
        return [
            {
                label: 'IGST (18%)',
                amount: gstData.igst,
            },
        ];
    } else {
        // Show separate CGST and SGST for Delhi
        return [
            {
                label: 'CGST (9%)',
                amount: gstData.cgst,
            },
            {
                label: 'SGST (9%)',
                amount: gstData.sgst,
            },
        ];
    }
}

/**
 * Example usage in a component:
 * 
 * ```tsx
 * import { formatGSTForDisplay } from '@/utils/gstHelpers';
 * 
 * const gstLineItems = formatGSTForDisplay(
 *     spaceData?.City?.state,
 *     bookingData.cgst,
 *     bookingData.sgst
 * );
 * 
 * // Render:
 * {gstLineItems.map((item, index) => (
 *     <div key={index}>
 *         <span>{item.label}</span>
 *         <span>₹{item.amount}</span>
 *     </div>
 * ))}
 * ```
 */
