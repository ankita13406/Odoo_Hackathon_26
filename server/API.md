# AssetFlow API

Base URL: `http://localhost:5000/api`
All routes except `/auth/*` require header: `Authorization: Bearer <token>`

---

## Auth

### POST /auth/signup
Body: `{ "name": string, "email": string, "password": string }`
Response 201:
```json
{ "success": true, "data": { "id": 2, "email": "test@x.com", "role": "Employee" } }
```

### POST /auth/login
Body: `{ "email": string, "password": string }`
Response 200:
```json
{ "success": true, "data": { "token": "...", "user": { "id": 1, "name": "Admin", "role": "Admin", "email": "admin@assetflow.com" } } }
```

---

## Departments
Auth: GET routes — any logged-in user. POST/PUT/DELETE — Admin only.

### GET /departments
Response 200:
```json
{ "success": true, "data": [ { "id": 1, "name": "Engineering Dept", "headId": null, "parentDeptId": null, "status": "Active", "createdAt": "...", "parent": null, "children": [] } ] }
```

### GET /departments/:id
Response 200:
```json
{ "success": true, "data": { "id": 1, "name": "Engineering Dept", "headId": null, "parentDeptId": null, "status": "Active", "createdAt": "...", "parent": null, "children": [], "employees": [] } }
```

### POST /departments
Body: `{ "name": string, "headId"?: number, "parentDeptId"?: number }`
Response 201:
```json
{ "success": true, "data": { "id": 4, "name": "QA", "headId": null, "parentDeptId": 1, "status": "Active", "createdAt": "..." } }
```

### PUT /departments/:id
Body: any subset of `{ "name", "headId", "parentDeptId", "status" }`
Response 200:
```json
{ "success": true, "data": { "id": 1, "name": "Engineering Dept", "headId": null, "parentDeptId": null, "status": "Active", "createdAt": "..." } }
```

### DELETE /departments/:id
Response 200:
```json
{ "success": true, "data": { "deleted": true } }
```

---

## Categories
Auth: GET routes — any logged-in user. POST/PUT/DELETE — Admin only.

### POST /categories
Body: `{ "name": string, "extraFields"?: object }`
Response 201:
```json
{ "success": true, "data": { "id": 3, "name": "Electronics", "extraFields": {"warrantyMonths":24}, "createdAt": "2026-07-12T07:46:08.403Z" } }
```
> Note: `extraFields` displays blank in PowerShell's default table output — verify with `| ConvertTo-Json -Depth 5` to confirm the object is actually saved, don't rely on the table view.

### GET /categories
Response 200:
```json
{ "success": true, "data": [ { "id": 1, "name": "Electronics", "extraFields": {...}, "createdAt": "..." }, { "id": 2, "name": "Electronics", "extraFields": {...}, "createdAt": "..." } ] }
```

### PUT /categories/:id
Body: `{ "name"?, "extraFields"? }`
Response 200:
```json
{ "success": true, "data": { "id": 1, "name": "Electronics", "extraFields": {"warrantyMonths":36}, "createdAt": "2026-07-12T04:53:37.873Z" } }
```

### DELETE /categories/:id
Response 200:
```json
{ "success": true, "data": { "deleted": true } }
```