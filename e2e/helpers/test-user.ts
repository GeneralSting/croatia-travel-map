// A dedicated throwaway account used ONLY by e2e tests. It is created (pre-confirmed) in
// global-setup and deleted in global-teardown, so it never lingers — and because every user-data
// table cascades on auth.users delete, removing this user wipes everything it created. The `.test`
// domain guarantees it can never collide with a real address.
/**
 * Dedicated throwaway account used only by E2E tests. it is created (pre-confirmed) in global-setup and
 * deleted in global-teardown, so it never lingers - and because every user-data table cascades on
 * auth.users delete, removing this user wipes everything it created.
 * The ".test" domain guarantees it can never collide with a real address
 */
export const TEST_USER = {
  email: "e2e-tester@croatia-explorer.test",
  password: "e2e-Test-Password-123",
};
