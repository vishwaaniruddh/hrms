<?php
/**
 * Role Model
 * Handles roles and permissions CRUD
 */
class RoleModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Get all roles
     */
    public function getAll(): array
    {
        $stmt = $this->db->query("SELECT * FROM roles ORDER BY id ASC");
        return $stmt->fetchAll();
    }

    /**
     * Find role by ID
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM roles WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $role = $stmt->fetch();
        return $role ?: null;
    }

    /**
     * Get permissions for a role
     */
    public function getPermissions(int $roleId): array
    {
        $stmt = $this->db->prepare(
            "SELECT p.* FROM permissions p
             INNER JOIN role_permissions rp ON p.id = rp.permission_id
             WHERE rp.role_id = :role_id
             ORDER BY p.module, p.name"
        );
        $stmt->execute(['role_id' => $roleId]);
        return $stmt->fetchAll();
    }

    /**
     * Get all permissions
     */
    public function getAllPermissions(): array
    {
        $stmt = $this->db->query("SELECT * FROM permissions ORDER BY module, name");
        return $stmt->fetchAll();
    }
}
