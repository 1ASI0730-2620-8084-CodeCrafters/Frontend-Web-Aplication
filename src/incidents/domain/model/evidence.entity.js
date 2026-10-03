export class Evidence {
    constructor({ id = null, incidentId = null, fileUrl = '', fileType = 'image', uploadedAt = '', uploadedBy = null }) {
        this.id = id;
        this.incidentId = incidentId;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
        this.uploadedAt = uploadedAt;
        this.uploadedBy = uploadedBy;
    }
}

export class AttachEvidenceCommand {
    constructor({ incidentId, fileUrl, uploadedBy }) {
        this.incidentId = incidentId;
        this.fileUrl = fileUrl.trim();
        this.uploadedBy = uploadedBy;
    }

    get isValid() {
        try {
            const url = new URL(this.fileUrl);
            return Boolean(this.incidentId && this.uploadedBy && ['http:', 'https:'].includes(url.protocol));
        } catch {
            return false;
        }
    }
}
