import express from 'express';
import { verifyToken, requirePermission } from '../../../middleware/authMiddleware';
import { auditService } from '../../system/AuditService';
import { getServer } from '../ServerService';
import { playerService } from '../PlayerService';
import { processManager } from '../../processes/ProcessManager';

const router = express.Router({ mergeParams: true });

// Kick Player
router.post('/kick-player', verifyToken, requirePermission('server.players.manage'), async (req, res) => {
    const { id } = req.params as { id: string };
    const { name, reason } = req.body;
    const server = getServer(id);
    if (!server) return res.status(404).json({ error: 'Server not found' });

    try {
        await playerService.kickPlayer(id, name, reason);
        res.json({ success: true, message: `Kicked ${name}` });
        if (req.user) auditService.log(req.user.id, 'PLAYER_KICK', id, { playerName: name, reason });
    } catch (e: unknown) {
        res.status(500).json({ error: e.message });
    }
});

// Get Player List
router.get('/players/:listType', async (req, res) => {
    const { id, listType } = req.params as { id: string, listType: string };
    const server = getServer(id);
    if (!server) return res.status(404).json({ error: 'Server not found' });

    try {
        const list = await playerService.getPlayerList(id, listType as unknown);
        res.json(list);
    } catch (e: unknown) {
        res.status(500).json({ error: e.message });
    }
});

// Add Player (Op, Whitelist, Ban)
router.post('/players/:listType', verifyToken, requirePermission('server.players.manage'), async (req, res) => {
    const { id, listType } = req.params as { id: string, listType: string };
    const { identifier } = req.body;
    const server = getServer(id);
    if (!server) return res.status(404).json({ error: 'Server not found' });
    if (!identifier) return res.status(400).json({ error: 'Identifier is required' });

    try {
        const result = await playerService.addPlayer(id, listType as unknown, identifier);
        res.json(result);
        
        const actionMap: unknown = { 'ops': 'PLAYER_OP', 'banned-players': 'PLAYER_BAN', 'whitelist': 'PLAYER_WHITELIST_ADD' };
        const action = actionMap[listType] || 'USER_UPDATE';
        if (req.user) auditService.log(req.user.id, action as unknown, id, { playerName: identifier });
    } catch (e: unknown) {
        res.status(500).json({ error: e.message });
    }
});

// Remove Player
router.delete('/players/:listType/:identifier', verifyToken, requirePermission('server.players.manage'), async (req, res) => {
    const { id, listType, identifier } = req.params as { id: string, listType: string, identifier: string };
    const server = getServer(id);
    if (!server) return res.status(404).json({ error: 'Server not found' });

    try {
        const result = await playerService.removePlayer(id, listType as unknown, identifier);
        res.json(result);

        const actionMap: unknown = { 'ops': 'PLAYER_DEOP', 'banned-players': 'PLAYER_PARDON', 'whitelist': 'PLAYER_WHITELIST_REMOVE' };
        const action = actionMap[listType] || 'USER_UPDATE';
        if (req.user) auditService.log(req.user.id, action as unknown, id, { playerName: identifier });
    } catch (e: unknown) {
        res.status(500).json({ error: e.message });
    }
});

// Get Player Activity History
router.get('/activity', verifyToken, async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        const history = processManager.getActivityHistory(id);
        res.json(history);
    } catch (e: unknown) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
