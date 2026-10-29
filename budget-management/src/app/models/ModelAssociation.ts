import Budget from './Budget';
import BudgetItem from './BudgetItem';
import BudgetAttachment from './BudgetAttachment';

export const defineModelAssociations = () => {
// Budget Associations
Budget.hasMany(BudgetItem, {
  foreignKey: 'budget_id',
  as: 'budget_items',
});

Budget.hasMany(BudgetAttachment, {
  foreignKey: 'budget_id',
  as: 'budget_attachments',
});

// BudgetItem Associations
BudgetItem.belongsTo(Budget, {
  foreignKey: 'budget_id',
  as: 'budget',
});

// BudgetAttachment Associations
BudgetAttachment.belongsTo(Budget, {
  foreignKey: 'budget_id',
  as: 'budget',
});

};