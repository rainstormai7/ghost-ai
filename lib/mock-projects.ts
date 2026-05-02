export interface MockProject {
  id: string
  name: string
  slug: string
  /** Owner rows show rename/delete; collaborator rows are listed under Shared only. */
  isOwner: boolean
}

export const INITIAL_MOCK_PROJECTS: MockProject[] = [
  {
    id: "mock-owned-1",
    name: "API Gateway",
    slug: "api-gateway",
    isOwner: true,
  },
  {
    id: "mock-owned-2",
    name: "Billing Service",
    slug: "billing-service",
    isOwner: true,
  },
  {
    id: "mock-shared-1",
    name: "Team Infra Map",
    slug: "team-infra-map",
    isOwner: false,
  },
]
