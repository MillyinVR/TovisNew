# Firestore Database Structure for Large-Scale User Management

This document outlines the optimized Firestore database structure designed to support a large number of users (50,000+ professionals in the first year) while maintaining high performance and scalability.

## Overview

The database structure is organized around separate collections for different user types, with a social media-like experience for content discovery ("The Looks" feature) and geolocation-based professional discovery.

## Collections Structure

```
/users (collection) - Core user data
  /{userId} (document)
    - uid
    - email
    - displayName
    - role (admin, professional, client)
    - basic shared fields
    
/professionals (collection) - Professional-specific data
  /{professionalId} (document)
    - uid (same as userId)
    - professionalType
    - licenseInfo
    - verification status
    - expertise
    - yearsOfExperience
    - etc.
    
    /workingHours (subcollection)
      /{day} (document)
    
    /timeOff (subcollection)
      /{timeOffId} (document)
    
    /services (subcollection)
      /{serviceId} (document)
    
    /portfolio (subcollection)
      /{itemId} (document)
    
    /licenses (subcollection)
      /{licenseId} (document)

/clients (collection) - Client-specific data
  /{clientId} (document)
    - uid (same as userId)
    - client-specific fields
    - preferences
    - etc.

/admins (collection) - Admin-specific data
  /{adminId} (document)
    - uid (same as userId)
    - admin-specific permissions
    - etc.

/content (collection) - All professional content for discovery
  /{contentId} (document)
    - professionalId
    - type (image/video)
    - url
    - thumbnail
    - caption
    - serviceIds
    - categoryIds
    - tags
    - location
    - views/likes/comments
    - engagementScore
    
    /comments (subcollection)
      /{commentId} (document)

/theLooks (collection) - Curated feed for discovery
  /{lookId} (document)
    - contentId
    - score
    - categoryId
    - serviceId
    - region
    - trendingScore
    - featuredUntil

/geoIndex (collection) - Geospatial indexing
  /{geohash} (document)
    - professionalIds
    - serviceIds
    - updatedAt

/userActivity (collection) - User engagement tracking
  /{userId}_activity (document)
    - viewedContent
    - likedContent
    - viewedProfessionals
    - viewedServices
    - searchHistory
    - categoryPreferences

/userRecommendations (collection) - Personalized recommendations
  /{userId}_recommendations (document)
    - recommendedContent
    - recommendedProfessionals
    - recommendedServices
    - generatedAt

/appointments (collection) - Booking data
  /{appointmentId} (document)
    - clientId
    - professionalId
    - serviceId
    - date/time
    - status
    - etc.

/serviceCategories (collection) - Service categories
  /{categoryId} (document)
    - name
    - description
    - imageUrl
    - etc.

/services (collection) - Base service definitions
  /{serviceId} (document)
    - name
    - description
    - basePrice
    - baseDuration
    - categoryId
    - etc.

/reviews (collection) - User reviews
  /{reviewId} (document)
    - clientId
    - professionalId
    - serviceId
    - rating
    - comment
    - images
    - etc.

/conversations (collection) - Messaging
  /{conversationId} (document)
    - participants
    - lastMessage
    - lastMessageTime
    
    /messages (subcollection)
      /{messageId} (document)
```

## Key Features

### 1. Role-Specific Collections

Users are stored in role-specific collections (`professionals`, `clients`, `admins`) while maintaining a core `users` collection for authentication. This approach:

- Improves query performance by avoiding filtering by role
- Allows for role-specific fields without bloating documents
- Enables more granular security rules

### 2. Social Media Experience ("The Looks")

The `content` and `theLooks` collections work together to provide a TikTok-like discovery experience:

- `content` stores all professional-created content with engagement metrics
- `theLooks` provides a curated feed with algorithm scores
- Content is linked to services and categories for contextual discovery

### 3. Geolocation-Based Discovery

The `geoIndex` collection enables efficient geospatial queries:

- Uses geohash system for proximity searches
- Links professionals and services to geographic areas
- Supports "find professionals near me" functionality

### 4. User Personalization

The `userActivity` and `userRecommendations` collections enable personalized experiences:

- Tracks user interactions and preferences
- Generates personalized recommendations
- Supports algorithm learning based on user behavior

## Migration Process

To migrate from the current structure to the new structure:

1. Run the migration script: `node scripts/migrateToNewStructure.js`
2. Deploy the Cloud Functions that maintain the new structure
3. Update client code to use the new structure

The migration script will:

1. Create documents in role-specific collections based on user roles
2. Copy subcollections as needed
3. Create initial content and theLooks collections from portfolio items
4. Generate the geoIndex based on professional locations

## Cloud Functions

Several Cloud Functions maintain the integrity of the new structure:

- `syncUserToRoleCollection`: Keeps role-specific collections in sync with the users collection
- `syncPortfolioToContent`: Updates the content collection when portfolio items change
- `updateGeoIndex`: Maintains the geoIndex when professional locations change
- `updateContentEngagement`: Updates engagement scores and trending metrics
- `createUserActivity`: Creates activity tracking for new users
- `createUserRecommendations`: Generates initial recommendations for new users

## Security Considerations

The updated Firestore security rules ensure:

- Users can only access their own data
- Professionals can only update their own content
- Clients can only view public data and manage their own appointments
- Admins have appropriate access to manage the platform

## Performance Benefits

This structure is optimized for:

1. **Read Performance**: Most common queries (browsing professionals, services, content) are optimized
2. **Write Scalability**: Separating collections prevents contention
3. **Query Efficiency**: Specialized indexes for common access patterns
4. **Reduced Document Size**: Role-specific fields are only stored where needed

## Implementation Timeline

1. **Phase 1**: Deploy security rules and Cloud Functions
2. **Phase 2**: Run migration script in development environment
3. **Phase 3**: Update client code to use new structure
4. **Phase 4**: Run migration in production and switch to new structure

## Monitoring and Maintenance

After migration:

1. Monitor Firestore usage and performance
2. Adjust indexes as needed based on query patterns
3. Optimize Cloud Functions if performance issues arise
4. Consider implementing caching for frequently accessed data
