#!/bin/bash
# Setup 3 groups + 3 test users on production Vercel
# Grup Humas       → admin-cms (Website Publik)
# Grup Organisasi  → admin-members, admin-events, admin-certificates
# Grup Publikasi   → admin-cms (Digital Library — within CMS module)

PROD_URL="https://iaa-digital.vercel.app"
COOKIE_FILE=$(mktemp)

echo "=== Step 1: Login as superadmin ==="
LOGIN_RES=$(curl -s -c "$COOKIE_FILE" -X POST "$PROD_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@iaa-anri.go.id","password":"password"}')
if echo "$LOGIN_RES" | grep -q '"user"'; then
  echo "✅ Login sukses"
else
  echo "❌ Login gagal: $LOGIN_RES"
  exit 1
fi

echo ""
echo "=== Step 2: Cleanup existing groups (if any) ==="
EXISTING_GROUPS=$(curl -s -b "$COOKIE_FILE" "$PROD_URL/api/groups" | python3 -c "
import json, sys
d = json.load(sys.stdin)
for g in d.get('groups', []):
    print(g['id'])
")
for GID in $EXISTING_GROUPS; do
  curl -s -b "$COOKIE_FILE" -X DELETE "$PROD_URL/api/groups?id=$GID" > /dev/null
  echo "  Deleted: $GID"
done

echo ""
echo "=== Step 3: Create 3 groups ==="

echo "--- Grup Humas ---"
HUMAS_RES=$(curl -s -b "$COOKIE_FILE" -X POST "$PROD_URL/api/groups" \
  -H "Content-Type: application/json" \
  -d '{"name":"Grup Humas","description":"Akses modul Website Publik (CMS)","color":"emerald"}')
HUMAS_ID=$(echo "$HUMAS_RES" | python3 -c "import json,sys; print(json.load(sys.stdin)['group']['id'])")
echo "✅ Grup Humas ID: $HUMAS_ID"

echo "--- Grup Organisasi ---"
ORG_RES=$(curl -s -b "$COOKIE_FILE" -X POST "$PROD_URL/api/groups" \
  -H "Content-Type: application/json" \
  -d '{"name":"Grup Organisasi","description":"Akses modul Anggota, Event, Sertifikat","color":"blue"}')
ORG_ID=$(echo "$ORG_RES" | python3 -c "import json,sys; print(json.load(sys.stdin)['group']['id'])")
echo "✅ Grup Organisasi ID: $ORG_ID"

echo "--- Grup Publikasi ---"
PUB_RES=$(curl -s -b "$COOKIE_FILE" -X POST "$PROD_URL/api/groups" \
  -H "Content-Type: application/json" \
  -d '{"name":"Grup Publikasi","description":"Akses modul Digital Library","color":"purple"}')
PUB_ID=$(echo "$PUB_RES" | python3 -c "import json,sys; print(json.load(sys.stdin)['group']['id'])")
echo "✅ Grup Publikasi ID: $PUB_ID"

echo ""
echo "=== Step 4: Set permissions per grup ==="

echo "--- Grup Humas → admin-cms (full CRUD) ---"
curl -s -b "$COOKIE_FILE" -X POST "$PROD_URL/api/groups?id=$HUMAS_ID&action=setPermissions" \
  -H "Content-Type: application/json" \
  -d '{"permissions":[
    {"module":"admin-cms","canView":true,"canCreate":true,"canEdit":true,"canDelete":true}
  ]}' | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'  ✅ {d.get(\"count\",0)} permission disimpan')"

echo "--- Grup Organisasi → admin-members, admin-events, admin-certificates (full CRUD) ---"
curl -s -b "$COOKIE_FILE" -X POST "$PROD_URL/api/groups?id=$ORG_ID&action=setPermissions" \
  -H "Content-Type: application/json" \
  -d '{"permissions":[
    {"module":"admin-members","canView":true,"canCreate":true,"canEdit":true,"canDelete":true},
    {"module":"admin-events","canView":true,"canCreate":true,"canEdit":true,"canDelete":true},
    {"module":"admin-certificates","canView":true,"canCreate":true,"canEdit":true,"canDelete":true}
  ]}' | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'  ✅ {d.get(\"count\",0)} permission disimpan')"

echo "--- Grup Publikasi → admin-cms (view + create + edit, no delete) ---"
curl -s -b "$COOKIE_FILE" -X POST "$PROD_URL/api/groups?id=$PUB_ID&action=setPermissions" \
  -H "Content-Type: application/json" \
  -d '{"permissions":[
    {"module":"admin-cms","canView":true,"canCreate":true,"canEdit":true,"canDelete":false}
  ]}' | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'  ✅ {d.get(\"count\",0)} permission disimpan')"

echo ""
echo "=== Step 5: Create 3 test users ==="

echo "--- Create humas_test user ---"
HUMAS_USER_RES=$(curl -s -b "$COOKIE_FILE" -X POST "$PROD_URL/api/members-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"humas.test@iaa-anri.go.id",
    "password":"humas12345",
    "name":"Tim Humas",
    "role":"PENGURUS",
    "memberNumber":"IAA-HUMAS-001",
    "fullName":"Tim Humas IAA",
    "workUnit":"Sekretariat IAA",
    "position":"Staf Humas",
    "status":"AKTIF"
  }')
HUMAS_USER_ID=$(echo "$HUMAS_USER_RES" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('member',{}).get('userId',''))" 2>/dev/null)
if [ -n "$HUMAS_USER_ID" ]; then
  echo "✅ humas.test@iaa-anri.go.id created (ID: $HUMAS_USER_ID)"
else
  echo "⚠️  humas user: $HUMAS_USER_RES" | head -c 200
  # Try to get existing user ID
  HUMAS_USER_ID=$(curl -s -b "$COOKIE_FILE" "$PROD_URL/api/members-admin?limit=200" | python3 -c "
import json, sys
d = json.load(sys.stdin)
for m in d.get('members', []):
    if m.get('user', {}).get('email') == 'humas.test@iaa-anri.go.id':
        print(m.get('userId'))
        break
" 2>/dev/null)
  echo "  Found existing ID: $HUMAS_USER_ID"
fi

echo "--- Create organisasi_test user ---"
ORG_USER_RES=$(curl -s -b "$COOKIE_FILE" -X POST "$PROD_URL/api/members-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"organisasi.test@iaa-anri.go.id",
    "password":"organisasi12345",
    "name":"Tim Organisasi",
    "role":"PENGURUS",
    "memberNumber":"IAA-ORG-001",
    "fullName":"Tim Organisasi IAA",
    "workUnit":"Sekretariat IAA",
    "position":"Staf Organisasi",
    "status":"AKTIF"
  }')
ORG_USER_ID=$(echo "$ORG_USER_RES" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('member',{}).get('userId',''))" 2>/dev/null)
if [ -n "$ORG_USER_ID" ]; then
  echo "✅ organisasi.test@iaa-anri.go.id created (ID: $ORG_USER_ID)"
else
  echo "⚠️  organisasi user: $ORG_USER_RES" | head -c 200
  ORG_USER_ID=$(curl -s -b "$COOKIE_FILE" "$PROD_URL/api/members-admin?limit=200" | python3 -c "
import json, sys
d = json.load(sys.stdin)
for m in d.get('members', []):
    if m.get('user', {}).get('email') == 'organisasi.test@iaa-anri.go.id':
        print(m.get('userId'))
        break
" 2>/dev/null)
  echo "  Found existing ID: $ORG_USER_ID"
fi

echo "--- Create publikasi_test user ---"
PUB_USER_RES=$(curl -s -b "$COOKIE_FILE" -X POST "$PROD_URL/api/members-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"publikasi.test@iaa-anri.go.id",
    "password":"publikasi12345",
    "name":"Tim Publikasi",
    "role":"PENGURUS",
    "memberNumber":"IAA-PUB-001",
    "fullName":"Tim Publikasi IAA",
    "workUnit":"Sekretariat IAA",
    "position":"Staf Publikasi",
    "status":"AKTIF"
  }')
PUB_USER_ID=$(echo "$PUB_USER_RES" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('member',{}).get('userId',''))" 2>/dev/null)
if [ -n "$PUB_USER_ID" ]; then
  echo "✅ publikasi.test@iaa-anri.go.id created (ID: $PUB_USER_ID)"
else
  echo "⚠️  publikasi user: $PUB_USER_RES" | head -c 200
  PUB_USER_ID=$(curl -s -b "$COOKIE_FILE" "$PROD_URL/api/members-admin?limit=200" | python3 -c "
import json, sys
d = json.load(sys.stdin)
for m in d.get('members', []):
    if m.get('user', {}).get('email') == 'publikasi.test@iaa-anri.go.id':
        print(m.get('userId'))
        break
" 2>/dev/null)
  echo "  Found existing ID: $PUB_USER_ID"
fi

echo ""
echo "=== Step 6: Assign users to groups ==="

echo "--- Assign humas_test → Grup Humas ---"
curl -s -b "$COOKIE_FILE" -X POST "$PROD_URL/api/groups?id=$HUMAS_ID&action=addMember" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$HUMAS_USER_ID\"}" | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'  ✅ {d}')"

echo "--- Assign organisasi_test → Grup Organisasi ---"
curl -s -b "$COOKIE_FILE" -X POST "$PROD_URL/api/groups?id=$ORG_ID&action=addMember" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$ORG_USER_ID\"}" | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'  ✅ {d}')"

echo "--- Assign publikasi_test → Grup Publikasi ---"
curl -s -b "$COOKIE_FILE" -X POST "$PROD_URL/api/groups?id=$PUB_ID&action=addMember" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$PUB_USER_ID\"}" | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'  ✅ {d}')"

echo ""
echo "=== Step 7: Verify permissions per user ==="

verify_user() {
  local EMAIL=$1
  local PASSWORD=$2
  local LABEL=$3
  echo "--- $LABEL ($EMAIL) ---"
  COOKIE2=$(mktemp)
  curl -s -c "$COOKIE2" -X POST "$PROD_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" > /dev/null
  curl -s -b "$COOKIE2" "$PROD_URL/api/groups?me=true" | python3 -c "
import json, sys
d = json.load(sys.stdin)
groups = [g['name'] for g in d.get('groups', [])]
print(f'  Groups: {groups}')
print(f'  Permissions:')
for mod, p in sorted(d.get('permissions', {}).items()):
    perms = []
    if p['canView']: perms.append('View')
    if p['canCreate']: perms.append('Create')
    if p['canEdit']: perms.append('Edit')
    if p['canDelete']: perms.append('Delete')
    if perms:
        print(f'    {mod}: {', '.join(perms)}')
"
  rm -f "$COOKIE2"
}

verify_user "humas.test@iaa-anri.go.id" "humas12345" "Tim Humas"
verify_user "organisasi.test@iaa-anri.go.id" "organisasi12345" "Tim Organisasi"
verify_user "publikasi.test@iaa-anri.go.id" "publikasi12345" "Tim Publikasi"

echo ""
echo "=== DONE ==="
echo ""
echo "Login credentials for testing:"
echo "  Grup Humas:       humas.test@iaa-anri.go.id / humas12345"
echo "  Grup Organisasi:  organisasi.test@iaa-anri.go.id / organisasi12345"
echo "  Grup Publikasi:   publikasi.test@iaa-anri.go.id / publikasi12345"
echo ""
echo "URL: https://iaa-digital.vercel.app"
