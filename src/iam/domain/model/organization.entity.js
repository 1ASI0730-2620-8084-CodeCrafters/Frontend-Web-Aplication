export class Organization {
    constructor({ id = null, businessName = '', taxId = '', email = '', phone = '', address = '' }) {
        this.id = id;
        this.businessName = businessName;
        this.taxId = taxId;
        this.email = email;
        this.phone = phone;
        this.address = address;
    }
}
