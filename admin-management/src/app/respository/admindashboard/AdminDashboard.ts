import dayjs from "dayjs";
import { QueryTypes } from "sequelize";
import AppDataSource from "../../../config/DatabaseSource";
import AdminDashboardWidget from "../../models/AdminDashboardWidget";

export const procurementDashboardService = async (
    organizationId: string,
    subsidiaryId: string,
    filter: string,
    startDate?: string,
    endDate?: string,
) => {
    try {
        console.log("\n========== PROCUREMENT DASHBOARD START ==========");
        console.log("Input Params =>", { organizationId, subsidiaryId, filter, startDate, endDate });

        /* =====================================
           ✅ Validate Organization & Subsidiary
        ====================================== */

        const orgCheck: any = await AppDataSource.query(
            `SELECT id FROM organizations WHERE id = :organizationId`,
            { replacements: { organizationId }, type: QueryTypes.SELECT },
        );
        console.log("[ORG CHECK] Result:", orgCheck);

        if (!orgCheck.length) {
            console.error("[ORG CHECK] ❌ Organization not found for id:", organizationId);
            throw new Error("Organization not found");
        }
        console.log("[ORG CHECK] ✅ Organization found");

        const subCheck: any = await AppDataSource.query(
            `SELECT id FROM subsidiaries WHERE id = :subsidiaryId AND organization_id = :organizationId`,
            { replacements: { organizationId, subsidiaryId }, type: QueryTypes.SELECT },
        );
        console.log("[SUB CHECK] Result:", subCheck);

        if (!subCheck.length) {
            console.error("[SUB CHECK] ❌ Subsidiary not found for id:", subsidiaryId, "under org:", organizationId);
            throw new Error("Subsidiary not found for this organization");
        }
        console.log("[SUB CHECK] ✅ Subsidiary found");

        /* =====================================
           Helpers
        ====================================== */

        const calcTrend = (current: number, previous: number) => {
            if (previous === 0 && current === 0) return { percentage: 0, trend: "no_change" };
            if (previous === 0) return { percentage: 100, trend: "up" };
            const change = ((current - previous) / previous) * 100;
            return {
                percentage: Math.abs(Number(change.toFixed(2))),
                trend: change > 0 ? "up" : change < 0 ? "down" : "no_change",
            };
        };

        /* =====================================
           SECTION 1 (Monthly Comparison)
        ====================================== */

        console.log("\n---------- SECTION 1: Monthly Comparison ----------");

        const currentStart = dayjs().startOf("month").toDate();
        const currentEnd = dayjs().endOf("month").toDate();
        const lastStart = dayjs().subtract(1, "month").startOf("month").toDate();
        const lastEnd = dayjs().subtract(1, "month").endOf("month").toDate();

        console.log("[SECTION 1] Current month range:", currentStart, "→", currentEnd);
        console.log("[SECTION 1] Last month range:", lastStart, "→", lastEnd);

        const baseFilter = `
      organization_id = :organizationId
      AND subsidiary_id = :subsidiaryId
    `;

        const totalSpendQuery = `
      SELECT COALESCE(SUM(total_order_amount),0) AS total
      FROM orders
      WHERE ${baseFilter}
      AND created_at BETWEEN :start AND :end
    `;

        const totalPOQuery = `
      SELECT COUNT(*)::int AS count
      FROM orders
      WHERE ${baseFilter}
      AND created_at BETWEEN :start AND :end
    `;

        const avgRequestQuery = `
      SELECT AVG(DATE_PART('day', expected_delivery_date - created_at)) AS avg_days
      FROM quotations
      WHERE ${baseFilter}
      AND created_at BETWEEN :start AND :end
    `;

        const totalBudgetQuery = `
      SELECT COALESCE(SUM(total_budget),0) AS total_budget,
             COALESCE(SUM(spent_budget_amount),0) AS spent_budget
      FROM budgets
      WHERE ${baseFilter}
      AND created_at BETWEEN :start AND :end
    `;

        const exec = async (query: string, start: Date, end: Date) => {
            const [result]: any = await AppDataSource.query(query, {
                replacements: { organizationId, subsidiaryId, start, end },
                type: QueryTypes.SELECT,
            });
            return result;
        };

        console.log("[SECTION 1] Running all parallel queries...");
        const [
            currentSpend,
            lastSpend,
            currentPO,
            lastPO,
            currentAvg,
            lastAvg,
        ] = await Promise.all([
            exec(totalSpendQuery, currentStart, currentEnd),
            exec(totalSpendQuery, lastStart, lastEnd),
            exec(totalPOQuery, currentStart, currentEnd),
            exec(totalPOQuery, lastStart, lastEnd),
            exec(avgRequestQuery, currentStart, currentEnd),
            exec(avgRequestQuery, lastStart, lastEnd),
        ]);

        console.log("[SECTION 1] currentSpend:", currentSpend);
        console.log("[SECTION 1] lastSpend:", lastSpend);
        console.log("[SECTION 1] currentPO:", currentPO);
        console.log("[SECTION 1] lastPO:", lastPO);
        console.log("[SECTION 1] currentAvg:", currentAvg);
        console.log("[SECTION 1] lastAvg:", lastAvg);

        const spendTrend = calcTrend(Number(currentSpend.total), Number(lastSpend.total));
        const poTrend = calcTrend(Number(currentPO.count), Number(lastPO.count));
        const avgTrend = calcTrend(Number(currentAvg.avg_days || 0), Number(lastAvg.avg_days || 0));

        console.log("[SECTION 1] spendTrend:", spendTrend);
        console.log("[SECTION 1] poTrend:", poTrend);
        console.log("[SECTION 1] avgTrend:", avgTrend);

        console.log("[SECTION 1] Running budget queries...");
        const [currentBudget, lastBudget] = await Promise.all([
            exec(totalBudgetQuery, currentStart, currentEnd),
            exec(totalBudgetQuery, lastStart, lastEnd),
        ]);

        console.log("[SECTION 1] currentBudget:", currentBudget);
        console.log("[SECTION 1] lastBudget:", lastBudget);

        const currentTotalBudget = Number(currentBudget.total_budget) || 0;
        const currentSpentBudget = Number(currentBudget.spent_budget) || 0;
        const lastTotalBudget = Number(lastBudget.total_budget) || 0;
        const lastSpentBudget = Number(lastBudget.spent_budget) || 0;

        const currentUtilization = currentTotalBudget > 0 ? (currentSpentBudget / currentTotalBudget) * 100 : 0;
        const lastUtilization = lastTotalBudget > 0 ? (lastSpentBudget / lastTotalBudget) * 100 : 0;
        const budgetTrend = calcTrend(currentUtilization, lastUtilization);

        console.log("[SECTION 1] currentUtilization:", currentUtilization, "% | lastUtilization:", lastUtilization, "%");
        console.log("[SECTION 1] budgetTrend:", budgetTrend);
        console.log("[SECTION 1] ✅ Done");

        /* =====================================
           SECTION 2 (Date Filter Cards)
        ====================================== */

        console.log("\n---------- SECTION 2: Date Filter Cards ----------");
        console.log("[SECTION 2] filter:", filter);

        let currStart: Date;
        let currEnd: Date = new Date();
        let prevStart: Date;
        let prevEnd: Date;

        switch (filter) {
            case "today":
                currStart = dayjs().startOf("day").toDate();
                prevStart = dayjs().subtract(1, "day").startOf("day").toDate();
                currEnd = dayjs().endOf("day").toDate();
                prevEnd = dayjs().subtract(1, "day").endOf("day").toDate();
                break;

            case "last7":
                currStart = dayjs().subtract(7, "day").toDate();
                prevStart = dayjs().subtract(14, "day").toDate();
                prevEnd = dayjs().subtract(7, "day").toDate();
                break;

            case "last30":
                currStart = dayjs().subtract(30, "day").toDate();
                prevStart = dayjs().subtract(60, "day").toDate();
                prevEnd = dayjs().subtract(30, "day").toDate();
                break;

            case "last3months":
                currStart = dayjs().subtract(3, "month").toDate();
                prevStart = dayjs().subtract(6, "month").toDate();
                prevEnd = dayjs().subtract(3, "month").toDate();
                break;

            case "last6months":
                currStart = dayjs().subtract(6, "month").toDate();
                prevStart = dayjs().subtract(12, "month").toDate();
                prevEnd = dayjs().subtract(6, "month").toDate();
                break;

            case "custom":
                if (!startDate || !endDate) {
                    console.error("[SECTION 2] ❌ Custom filter selected but startDate/endDate missing!", { startDate, endDate });
                    throw new Error("startDate and endDate are required for custom filter");
                }
                currStart = dayjs(startDate).startOf("day").toDate();
                currEnd = dayjs(endDate).endOf("day").toDate();
                const diffDays = dayjs(currEnd).diff(currStart, "day");
                prevStart = dayjs(currStart).subtract(diffDays + 1, "day").toDate();
                prevEnd = dayjs(currStart).subtract(1, "day").endOf("day").toDate();
                console.log("[SECTION 2] Custom diffDays:", diffDays);
                break;

            default:
                console.warn("[SECTION 2] ⚠️ Unknown filter value:", filter, "— falling back to current month");
                currStart = dayjs().startOf("month").toDate();
                currEnd = dayjs().endOf("month").toDate();
                prevStart = dayjs().subtract(1, "month").startOf("month").toDate();
                prevEnd = dayjs().subtract(1, "month").endOf("month").toDate();
        }

        console.log("[SECTION 2] currStart:", currStart, "| currEnd:", currEnd);
        console.log("[SECTION 2] prevStart:", prevStart!, "| prevEnd:", prevEnd!);

        const getCount = async (condition: string, start: Date, end: Date) => {
            const query = `
        SELECT COUNT(*)::int AS count
        FROM orders
        WHERE ${baseFilter}
        AND ${condition}
        AND created_at BETWEEN :start AND :end
      `;
            const [result]: any = await AppDataSource.query(query, {
                replacements: { organizationId, subsidiaryId, start, end },
                type: QueryTypes.SELECT,
            });
            return result.count;
        };

        console.log("[SECTION 2] Fetching order counts...");

        const currPending = await getCount(`admin_status = 'pending_approval'`, currStart, currEnd);
        const prevPending = await getCount(`admin_status = 'pending_approval'`, prevStart!, prevEnd!);
        console.log("[SECTION 2] pending_approval — curr:", currPending, "| prev:", prevPending);

        const currSent = await getCount(`admin_status = 'sent'`, currStart, currEnd);
        const prevSent = await getCount(`admin_status = 'sent'`, prevStart!, prevEnd!);
        console.log("[SECTION 2] sent — curr:", currSent, "| prev:", prevSent);

        const currTotalOrders = await getCount(`1=1`, currStart, currEnd);
        const prevTotalOrders = await getCount(`1=1`, prevStart!, prevEnd!);
        console.log("[SECTION 2] totalOrders — curr:", currTotalOrders, "| prev:", prevTotalOrders);

        const currReceiving = await getCount(
            `supplier_status IN ('delivered','in_fulfilment')`,
            currStart,
            currEnd,
        );
        const prevReceiving = await getCount(
            `supplier_status IN ('delivered','in_fulfilment')`,
            prevStart!,
            prevEnd!,
        );
        console.log("[SECTION 2] receiving — curr:", currReceiving, "| prev:", prevReceiving);

        const getInvoiceCount = async (start: Date, end: Date) => {
            const [result]: any = await AppDataSource.query(
                `
        SELECT COUNT(*)::int AS count
        FROM invoices
        WHERE organization_id = :organizationId
        AND subsidiary_id = :subsidiaryId
        AND created_at BETWEEN :start AND :end
        `,
                { replacements: { organizationId, subsidiaryId, start, end }, type: QueryTypes.SELECT },
            );
            return result.count;
        };

        const currInvoices = await getInvoiceCount(currStart, currEnd);
        const prevInvoices = await getInvoiceCount(prevStart!, prevEnd!);
        console.log("[SECTION 2] invoices — curr:", currInvoices, "| prev:", prevInvoices);

        const pendingTrend = calcTrend(currPending, prevPending);
        const sentTrend = calcTrend(currSent, prevSent);
        const totalOrdersTrend = calcTrend(currTotalOrders, prevTotalOrders);
        const receivingTrend = calcTrend(currReceiving, prevReceiving);
        const invoiceTrend = calcTrend(currInvoices, prevInvoices);

        console.log("[SECTION 2] ✅ Done");

        /* =====================================
           SECTION 3 (PO Insights / Supplier Breakdown)
        ====================================== */

        console.log("\n---------- SECTION 3: PO Insights ----------");

        const suppliers: any = await AppDataSource.query(
            `
      SELECT selected_supplier_id,
             SUM(total_order_amount) AS spend
      FROM orders
      WHERE ${baseFilter}
      GROUP BY selected_supplier_id
      `,
            { replacements: { organizationId, subsidiaryId }, type: QueryTypes.SELECT },
        );

        console.log("[SECTION 3] suppliers raw rows:", suppliers?.length, suppliers);

        const totalAmount = suppliers.reduce(
            (sum: number, s: any) => sum + Number(s.spend),
            0,
        );
        console.log("[SECTION 3] totalAmount:", totalAmount);

        const supplierIds = suppliers.map((s: any) => s.selected_supplier_id);
        console.log("[SECTION 3] supplierIds:", supplierIds);

        let users: any[] = [];

        if (supplierIds && supplierIds.length > 0) {
            users = await AppDataSource.query(
                `SELECT id, name, country FROM users WHERE id = ANY(ARRAY[:supplierIds]::uuid[])`,
                { replacements: { supplierIds }, type: QueryTypes.SELECT },
            );
            console.log("[SECTION 3] users fetched:", users?.length, users);
        } else {
            console.warn("[SECTION 3] ⚠️ No supplierIds found — skipping user fetch. This causes zero supplier data.");
        }

        const userMap: any = {};
        users.forEach((u: any) => (userMap[u.id] = u));

        const supplierBreakdown = suppliers.map((s: any) => {
            const supplier = userMap[s.selected_supplier_id];
            if (!supplier) {
                console.warn("[SECTION 3] ⚠️ No user found for selected_supplier_id:", s.selected_supplier_id);
            }
            const percentage = totalAmount ? ((s.spend / totalAmount) * 100).toFixed(2) : 0;
            return {
                supplier_name: supplier?.name || null,
                country: supplier?.country || null,
                spend_amount: Number(s.spend),
                percentage: Number(percentage),
            };
        });

        console.log("[SECTION 3] supplierBreakdown:", supplierBreakdown);
        console.log("[SECTION 3] ✅ Done");

        /* =====================================
           SECTION 4 (Budget Insights)
        ====================================== */

        console.log("\n---------- SECTION 4: Budget Insights ----------");

        const departmentBudgets: any = await AppDataSource.query(
            `
      SELECT 
          b.branch_department_id,
          bd.department_name,
          SUM(b.total_budget) AS total_budget,
          SUM(b.spent_budget_amount) AS spent_budget
      FROM budgets b
      LEFT JOIN branch_departments bd
        ON bd.id = b.branch_department_id
      WHERE b.organization_id = :organizationId
        AND b.subsidiary_id = :subsidiaryId
      GROUP BY b.branch_department_id, bd.department_name
      `,
            { replacements: { organizationId, subsidiaryId }, type: QueryTypes.SELECT },
        );

        console.log("[SECTION 4] departmentBudgets raw rows:", departmentBudgets?.length, departmentBudgets);

        if (!departmentBudgets?.length) {
            console.warn("[SECTION 4] ⚠️ No department budgets found for orgId:", organizationId, "subId:", subsidiaryId);
        }

        const departmentSummary = departmentBudgets.map((d: any) => ({
            branch_department_id: d.branch_department_id,
            department_name: d.department_name,
            total_budget: Number(d.total_budget) || 0,
            spent_budget: Number(d.spent_budget) || 0,
            remaining_budget: (Number(d.total_budget) || 0) - (Number(d.spent_budget) || 0),
        }));

        const monthlySpend: any = await AppDataSource.query(
            `
      SELECT 
          m.month,
          COALESCE(SUM(b.spent_budget_amount), 0) AS monthly_spent
      FROM generate_series(
          DATE_TRUNC('year', CURRENT_DATE),
          DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '11 months',
          INTERVAL '1 month'
      ) AS m(month)
      LEFT JOIN budgets b
        ON DATE_TRUNC('month', b.created_at) = m.month
        AND b.organization_id = :organizationId
        AND b.subsidiary_id = :subsidiaryId
      GROUP BY m.month
      ORDER BY m.month
      `,
            { replacements: { organizationId, subsidiaryId }, type: QueryTypes.SELECT },
        );

        console.log("[SECTION 4] monthlySpend raw rows:", monthlySpend?.length, monthlySpend);

        const monthlySummary = monthlySpend.map((m: any) => ({
            month: dayjs(m.month).format("MMMM"),
            spent_budget: Number(m.monthly_spent) || 0,
        }));

        console.log("[SECTION 4] monthlySummary:", monthlySummary);
        console.log("[SECTION 4] ✅ Done");

        console.log("\n========== PROCUREMENT DASHBOARD END (SUCCESS) ==========\n");

        return {
            section1: {
                total_spend: currentSpend.total,
                total_spend_change: spendTrend.percentage,
                total_spend_trend: spendTrend.trend,

                total_po: currentPO.count,
                total_po_change: poTrend.percentage,
                total_po_trend: poTrend.trend,

                avg_request_time_days: Number(currentAvg.avg_days || 0).toFixed(2),
                avg_request_time_change: avgTrend.percentage,
                avg_request_time_trend: avgTrend.trend,

                total_budget_utilization: Number(currentUtilization.toFixed(2)),
                total_budget_utilization_change: budgetTrend.percentage,
                total_budget_utilization_trend: budgetTrend.trend,

                monthly_total_budget: Number(currentBudget.total_budget || 0),
            },
            section2: {
                pending_approval: currPending,
                pending_approval_change: pendingTrend.percentage,
                pending_approval_trend: pendingTrend.trend,

                purchase_request: currSent,
                purchase_request_change: sentTrend.percentage,
                purchase_request_trend: sentTrend.trend,

                purchase_order: currTotalOrders,
                purchase_order_change: totalOrdersTrend.percentage,
                purchase_order_trend: totalOrdersTrend.trend,

                receiving: currReceiving,
                receiving_change: receivingTrend.percentage,
                receiving_trend: receivingTrend.trend,

                invoices: currInvoices,
                invoices_change: invoiceTrend.percentage,
                invoices_trend: invoiceTrend.trend,
            },
            section3: {
                total_spend_amount: totalAmount,
                suppliers: supplierBreakdown,
            },
            section4: {
                department_wise_budget: departmentSummary,
                monthly_budget_spend_current_year: monthlySummary,
            },
        };
    } catch (error: any) {
        console.error("\n========== PROCUREMENT DASHBOARD ERROR ==========");
        console.error("[ERROR] Message:", error?.message);
        console.error("[ERROR] Stack:", error?.stack);
        console.error("[ERROR] Full error object:", error);
        console.error("=================================================\n");
        throw new Error(error?.message || "Failed to fetch procurement dashboard data");
    }
};

/* ================= CREATE OR UPDATE ================= */
export const upsertDashboardService = async (payload: any) => {
    const { organization_id, ...rest } = payload;

    if (!organization_id) {
        throw new Error('organization_id is required');
    }

    const existing = await AdminDashboardWidget.findOne({
        where: { organization_id },
    });

    if (existing) {
        await existing.update(rest);
        return existing;
    }

    const created = await AdminDashboardWidget.create({
        organization_id,
        ...rest,
    });

    return created;
};

/* ================= GET ================= */
export const getDashboardService = async (organization_id: string) => {
    // try {
    if (!organization_id) {
        console.log("org required")
        throw new Error('organization_id is required');
    }

    const data = await AdminDashboardWidget.findOne({
        where: { organization_id },
    });
    console.log(data, "data return service")

    return data;
    // } catch (err) {
    //     console.error('SERVICE ERROR:', err);
    //     throw err;
    // }
};

