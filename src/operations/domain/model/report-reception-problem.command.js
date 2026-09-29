export const RECEPTION_PROBLEM_TYPES = Object.freeze(['shortage', 'damaged_product', 'broken_bottles']);

export class ReportReceptionProblemCommand {
    constructor({ deliveryOrder, reportedBy, type, affectedQuantity, description }) {
        this.deliveryOrder = deliveryOrder;
        this.reportedBy = reportedBy;
        this.type = type;
        this.affectedQuantity = affectedQuantity;
        this.description = description.trim();
    }

    get isValid() {
        return RECEPTION_PROBLEM_TYPES.includes(this.type) && this.affectedQuantity > 0;
    }
}
