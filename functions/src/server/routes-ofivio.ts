import type { Express } from "express";
import { requireAuth, requireRole } from "./auth";
import {
  insertOrganizationSettingsSchema,
  updateOrganizationSettingsSchema,
  insertBlogPostSchema,
  updateBlogPostSchema,
  insertSocialConnectionSchema,
} from "@shared/schema";
import admin from "firebase-admin";

const db = admin.firestore();
const Parser = require("rss-parser");
const rssParser = new Parser();

export function registerOfivioRoutes(app: Express) {
  // ============================================================================
  // ORGANIZATION SETTINGS ROUTES
  // ============================================================================

  // Get organization settings
  app.get("/api/orgs/:orgId/settings", requireAuth, async (req, res) => {
    try {
      const { orgId } = req.params;
      const doc = await db.collection("org_settings").doc(orgId).get();

      if (!doc.exists) {
        // Return default settings if not found
        return res.status(200).json({
          id: orgId,
          orgId,
          studioName: "Ofivio Studio",
          contactEmail: "hello@ofivio.com",
          defaultCurrency: "PKR",
          defaultAreaUnit: "sqm",
          timezone: "Asia/Karachi",
          theme: "default",
          languages: ["en"],
          blogEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error("Error fetching org settings:", error);
      res.status(500).json({ error: "Failed to fetch organization settings" });
    }
  });

  // Create or update organization settings
  app.post(
    "/api/orgs/:orgId/settings",
    requireAuth,
    requireRole("principle"),
    async (req, res) => {
      try {
        const { orgId } = req.params;
        const validatedData = insertOrganizationSettingsSchema.parse({
          ...req.body,
          orgId,
        });

        const timestamp = new Date();
        const settingsData = {
          ...validatedData,
          updatedAt: timestamp,
          createdAt: timestamp,
        };

        await db
          .collection("org_settings")
          .doc(orgId)
          .set(settingsData, { merge: true });

        res.json({
          message: "Settings updated successfully",
          data: settingsData,
        });
      } catch (error) {
        console.error("Error updating org settings:", error);
        res.status(500).json({ error: "Failed to update organization settings" });
      }
    }
  );

  // ============================================================================
  // BLOG ROUTES
  // ============================================================================

  // Get all published blog posts
  app.get("/api/blogs/:orgId", async (req, res) => {
    try {
      const { orgId } = req.params;
      const snapshot = await db
        .collection("blogs")
        .where("orgId", "==", orgId)
        .where("published", "==", true)
        .orderBy("publishedAt", "desc")
        .limit(50)
        .get();

      const posts = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  // Get single blog post by slug
  app.get("/api/blogs/:orgId/:slug", async (req, res) => {
    try {
      const { orgId, slug } = req.params;
      const snapshot = await db
        .collection("blogs")
        .where("orgId", "==", orgId)
        .where("slug", "==", slug)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      const doc = snapshot.docs[0];
      const post: any = { id: doc.id, ...doc.data() };

      // Increment view count
      await doc.ref.update({
        views: (post.views || 0) + 1,
      });

      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  // Create blog post (admin only)
  app.post(
    "/api/blogs/:orgId",
    requireAuth,
    requireRole("principle"),
    async (req, res) => {
      try {
        const { orgId } = req.params;
        const validatedData = insertBlogPostSchema.parse({
          ...req.body,
          orgId,
          authorId: req.user!.id,
        });

        const timestamp = new Date();
        const blogData = {
          ...validatedData,
          postId: `post_${Date.now()}`,
          authorName: req.user!.username || "Admin",
          views: 0,
          likes: 0,
          publishedAt: validatedData.published ? timestamp : null,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        const docRef = await db.collection("blogs").add(blogData);

        res.status(201).json({
          message: "Blog post created successfully",
          data: { id: docRef.id, ...blogData },
        });
      } catch (error) {
        console.error("Error creating blog post:", error);
        res.status(500).json({ error: "Failed to create blog post" });
      }
    }
  );

  // Update blog post (admin only)
  app.patch(
    "/api/blogs/:orgId/:id",
    requireAuth,
    requireRole("principle"),
    async (req, res) => {
      try {
        const { id } = req.params;
        const validatedData = updateBlogPostSchema.parse(req.body);

        const updateData: any = {
          ...validatedData,
          updatedAt: new Date(),
        };

        if (validatedData.published) {
          updateData.publishedAt = new Date();
        }

        await db.collection("blogs").doc(id).update(updateData);

        res.json({
          message: "Blog post updated successfully",
        });
      } catch (error) {
        console.error("Error updating blog post:", error);
        res.status(500).json({ error: "Failed to update blog post" });
      }
    }
  );

  // Delete blog post (admin only)
  app.delete(
    "/api/blogs/:orgId/:id",
    requireAuth,
    requireRole("principle"),
    async (req, res) => {
      try {
        const { id } = req.params;
        await db.collection("blogs").doc(id).delete();

        res.json({ message: "Blog post deleted successfully" });
      } catch (error) {
        console.error("Error deleting blog post:", error);
        res.status(500).json({ error: "Failed to delete blog post" });
      }
    }
  );

  // ============================================================================
  // NEWS TICKER ROUTES
  // ============================================================================

  // Get news ticker items (from RSS or manual)
  app.get("/api/news/:orgId", async (req, res) => {
    try {
      const { orgId } = req.params;

      // Check cache first
      const cacheDoc = await db
        .collection("news_cache")
        .doc(orgId)
        .get();

      if (cacheDoc.exists) {
        const cache = cacheDoc.data();
        if (cache && new Date(cache.expiresAt) > new Date()) {
          return res.json(cache.items);
        }
      }

      // Fetch org settings to get RSS feed URL
      const settingsDoc = await db
        .collection("org_settings")
        .doc(orgId)
        .get();

      const settings = settingsDoc.data();
      const rssUrl =
        settings?.newsTickerSource?.url ||
        process.env.DEFAULT_RSS_FEED_URL ||
        "https://techcrunch.com/feed/";

      // Parse RSS feed
      const feed = await rssParser.parseURL(rssUrl);
      const items = feed.items.slice(0, 10).map((item: any) => ({
        id: item.guid || item.link || "",
        title: item.title || "",
        url: item.link || "",
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      }));

      // Cache the results for 15 minutes
      await db
        .collection("news_cache")
        .doc(orgId)
        .set({
          id: orgId,
          orgId,
          items,
          lastFetchedAt: new Date(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        });

      res.json(items);
    } catch (error) {
      console.error("Error fetching news:", error);
      // Return empty array on error instead of failing
      res.json([]);
    }
  });

  // ============================================================================
  // SOCIAL CONNECTION ROUTES (Placeholder)
  // ============================================================================

  // Get social connections
  app.get(
    "/api/orgs/:orgId/social",
    requireAuth,
    requireRole("principle"),
    async (req, res) => {
      try {
        const { orgId } = req.params;
        const snapshot = await db
          .collection("social_connections")
          .where("orgId", "==", orgId)
          .get();

        const connections = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));

        res.json(connections);
      } catch (error) {
        console.error("Error fetching social connections:", error);
        res.status(500).json({ error: "Failed to fetch social connections" });
      }
    }
  );

  // Connect social account (placeholder)
  app.post(
    "/api/orgs/:orgId/social/connect",
    requireAuth,
    requireRole("principle"),
    async (req, res) => {
      try {
        res.status(501).json({
          message: "Social media integrations will be available in a future update",
        });
      } catch (error) {
        console.error("Error connecting social account:", error);
        res.status(500).json({ error: "Failed to connect social account" });
      }
    }
  );
}
