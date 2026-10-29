export type User =
  | {
      id: string;
      user_id_no: string | null;
      name: string;
      email: string;
      password: string;
      country: string | null;
      is_email_verified: boolean;
      is_supplier_capable: boolean | null;
      supplier_status: string | null;
      supplier_status_reason: string | null;
      supplier_approval_type:
        | "profile_update"
        | "new_vendor_registration"
        | null;
      google_id: string | null;
      microsoft_id: string | null;
      is_owner: boolean;
      user_type: "employee" | "admin" | "vendor";
      org_role_id: string | null;
      organization_id: string | null;
      email_verification_token: string | null;
      email_verification_expires: Date | null;
      reset_password_token: string | null;
      reset_password_expires: Date | null;
      subsidiary_branch_id: string | null;
      branch_department_id: string | null;
      subsidiary_id: string | null;
      is_head_department: boolean;
      onboard_completed: boolean;
      stepper: number;
      is_active: boolean;
      created_by: string | null;
      message: string | null;
    }
  | undefined;
