// Public surface of the shared filter dialog (see
// docs/reusable-filter-dialog-design.md). Pages import the component (to open
// it) plus the schema types; the model functions are exported for pages that
// want the summary (menu labels) or round-trip helpers.
export * from './filter-dialog-model';
export { SharedFilterDialogComponent } from './filter-dialog.component';
