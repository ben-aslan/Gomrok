export const MARZNESHIN_PANEL_PATTERNS = {
    USERS: {
        ADD: '/api/users',
        GET: '/api/users/',
        MODIFY: '/api/users/',
        REVOKE_SUB: '/api/users/{username}/revoke_sub',
        RESET: '/api/users/{username}/reset'
    },
    ADMINS: {
        TOKEN: "/api/admins/token"
    },
    SERVICES:{
        GET:'/api/services'
    }
}