import xlsx from "xlsx";

export const parseExcelBudgets = (filePath: string, organization_id: string) => {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = xlsx.utils.sheet_to_json(sheet);

  const groupedBudgets: Record<string, any> = {};

  for (const row of rows) {
    const budgetKey = `${row.name}-${row.start_date}`;

    if (!groupedBudgets[budgetKey]) {
      groupedBudgets[budgetKey] = {
        name: row.name,
        org_category_id: row.org_category_id,
        org_currency_id: row.org_currency_id,
        approval_workflow_id: row.approval_workflow_id,
        budget_cycle: row.budget_cycle,
        duration: row.duration,
        start_date: row.start_date,
        end_date: row.end_date,
        subsidiary_id: row.subsidiary_id,
        subsidiary_branch_id: row.subsidiary_branch_id,
        branch_department_id: row.branch_department_id,
        organization_id,
        budget_items: [],
        attachment_files: [],
      };
    }

    groupedBudgets[budgetKey].budget_items.push({
      item_name: row.item_name,
      amount: Number(row.amount),
      warning_limit: Number(row.warning_limit),
      allow_exceed_budget: row.allow_exceed_budget === "true",
    });

    if (row.attachment_urls) {
      const urls = row.attachment_urls.split(",").map((url: string) => url.trim());
      groupedBudgets[budgetKey].attachment_files.push(...urls);
    }
  }

  return groupedBudgets;
};
