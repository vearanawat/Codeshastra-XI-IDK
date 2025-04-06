import supabase from '../../backend/supabase/client';

// The bucket where all documents will be stored
const BUCKET_NAME = 'documents';

// Initialize the storage bucket if it doesn't exist
export const initializeStorage = async () => {
  try {
    // Check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    // Create the bucket if it doesn't exist
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false, // Private bucket
      });
      
      if (error) throw error;
      console.log(`Created bucket: ${BUCKET_NAME}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
};

// Upload a file to Supabase storage
export const uploadFile = async (file: File, userId: string, category: string) => {
  try {
    await initializeStorage();
    
    // Create a unique file path including user ID for access control
    // Format: userId/category/timestamp-filename
    const timestamp = new Date().getTime();
    const filePath = `${userId}/${category}/${timestamp}-${file.name}`;
    
    // Upload the file
    const { error, data } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) throw error;
    
    // Return the file details
    return {
      path: filePath,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      url: getFileUrl(filePath),
      category,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Get the URL for a file
export const getFileUrl = (filePath: string) => {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);
    
  return data.publicUrl;
};

// Download a file
export const downloadFile = async (filePath: string) => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(filePath);
    
  if (error) throw error;
  return data;
};

// List files for a specific user
export const listUserFiles = async (userId: string) => {
  try {
    // List all files in the user's directory
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`${userId}`, {
        sortBy: { column: 'name', order: 'asc' },
      });
      
    if (error) throw error;
    
    // Flatten the directory structure and get all files
    const allFiles = [];
    for (const item of data || []) {
      if (item.id) {
        // If it's a file, add it directly
        allFiles.push({
          ...item,
          path: `${userId}/${item.name}`,
        });
      } else {
        // If it's a directory, list its contents
        const { data: subDirData, error: subDirError } = await supabase.storage
          .from(BUCKET_NAME)
          .list(`${userId}/${item.name}`);
          
        if (subDirError) throw subDirError;
        
        // Add the category/subdirectory files
        for (const subItem of subDirData || []) {
          allFiles.push({
            ...subItem,
            category: item.name,
            path: `${userId}/${item.name}/${subItem.name}`,
          });
        }
      }
    }
    
    return allFiles;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

// List all files (admin only)
export const listAllFiles = async () => {
  try {
    // Get all root directories (user IDs)
    const { data: users, error: usersError } = await supabase.storage
      .from(BUCKET_NAME)
      .list();
      
    if (usersError) throw usersError;
    
    const allFiles = [];
    
    // For each user directory
    for (const user of users || []) {
      if (!user.id) { // If it's a directory
        // Get all categories for this user
        const { data: categories, error: categoriesError } = await supabase.storage
          .from(BUCKET_NAME)
          .list(user.name);
          
        if (categoriesError) throw categoriesError;
        
        // For each category directory
        for (const category of categories || []) {
          if (!category.id) { // If it's a directory
            // Get all files in this category
            const { data: files, error: filesError } = await supabase.storage
              .from(BUCKET_NAME)
              .list(`${user.name}/${category.name}`);
              
            if (filesError) throw filesError;
            
            // Add files with user and category info
            for (const file of files || []) {
              if (file.id) { // If it's a file
                allFiles.push({
                  ...file,
                  userId: user.name,
                  category: category.name,
                  path: `${user.name}/${category.name}/${file.name}`,
                });
              }
            }
          }
        }
      }
    }
    
    return allFiles;
  } catch (error) {
    console.error('Error listing all files:', error);
    throw error;
  }
};

// Delete a file
export const deleteFile = async (filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}; 