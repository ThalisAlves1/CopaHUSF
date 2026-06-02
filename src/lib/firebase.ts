// Compatibility layer kept so old imports continue working.
// The project database is Supabase. Do not import Firebase here.
export {
  dbGetUsers,
  dbSaveUsers,
  dbSaveSingleUser,
  dbDeleteUser,
  dbGetStickers,
  dbSaveWholeCatalog,
  dbInsertSticker,
  dbUpdateSticker,
  dbDeleteSticker,
  dbGetReleasedMetas,
  dbSaveReleasedMetas,
  subscribeToUsers,
  subscribeToStickers,
  subscribeToSettings,
} from './supabase';
