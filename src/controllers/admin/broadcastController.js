import { adminBroadcastService } from '../../services/admin/broadcastService.js';
import { getSenders } from '../../integrations/brevoClient.js';
import { fileUploadService } from '../../services/shared/fileUploadService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminBroadcastController {
  async getSenders(request, reply) {
    try {
      const senders = await getSenders();
      return reply.send(successResponse(senders, 'Senders retrieved successfully'));
    } catch (error) {
      throw error;
    }
  }

  async getSegmentCounts(request, reply) {
    try {
      const counts = await adminBroadcastService.getSegmentCounts();
      return reply.send(successResponse(counts, 'Segment counts retrieved successfully'));
    } catch (error) {
      throw error;
    }
  }

  async previewRecipients(request, reply) {
    try {
      const { segment, segment_criteria } = request.body;
      const result = await adminBroadcastService.previewRecipients(segment, segment_criteria);
      return reply.send(successResponse(result, 'Recipients resolved successfully'));
    } catch (error) {
      if (error.statusCode === 400) return reply.status(400).send(errorResponse(error.message, 400));
      throw error;
    }
  }

  async createBroadcast(request, reply) {
    try {
      const broadcast = await adminBroadcastService.createBroadcast(request.body, request.user.userId);

      // Respond immediately; send happens in the background so the request never blocks.
      reply.status(202).send(successResponse(broadcast, 'Broadcast accepted and is being sent'));

      const log = request.log;
      setImmediate(() => {
        adminBroadcastService.sendBroadcast(broadcast.id).catch((err) => {
          log.error({ err, broadcastId: broadcast.id }, '[AdminBroadcastController] sendBroadcast background error');
        });
      });

      return reply;
    } catch (error) {
      if (error.statusCode === 400) return reply.status(400).send(errorResponse(error.message, 400));
      throw error;
    }
  }

  async listBroadcasts(request, reply) {
    try {
      const data = await adminBroadcastService.listBroadcasts();
      return reply.send(successResponse(data, 'Broadcasts retrieved successfully'));
    } catch (error) {
      throw error;
    }
  }

  async getBroadcastById(request, reply) {
    try {
      const { id } = request.params;
      const broadcast = await adminBroadcastService.getBroadcastById(Number(id));
      return reply.send(successResponse(broadcast, 'Broadcast retrieved successfully'));
    } catch (error) {
      if (error.statusCode === 404) return reply.status(404).send(errorResponse(error.message, 404));
      throw error;
    }
  }

  async uploadImage(request, reply) {
    try {
      if (!request.uploadedFile) {
        return reply.status(400).send(errorResponse('No image file provided', 400));
      }

      const result = await fileUploadService.upload(request.uploadedFile);
      return reply.send(successResponse({ url: result.publicUrl }, 'Image uploaded successfully'));
    } catch (error) {
      if (error.statusCode === 400) return reply.status(400).send(errorResponse(error.message, 400));
      throw error;
    }
  }

  async refreshStats(request, reply) {
    try {
      const { id } = request.params;
      const broadcast = await adminBroadcastService.refreshStats(Number(id), request.log);
      return reply.send(successResponse(broadcast, 'Stats refreshed successfully'));
    } catch (error) {
      if (error.statusCode === 404) return reply.status(404).send(errorResponse(error.message, 404));
      if (error.statusCode === 400) return reply.status(400).send(errorResponse(error.message, 400));
      throw error;
    }
  }
}

export const adminBroadcastController = new AdminBroadcastController();
