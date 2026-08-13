import {
    supabaseClient,
} from "./supabaseClient";


export async function deleteMyInnerMirrorData():
  Promise<void> {
  const {
    data:
      authData,
    error:
      authError,
  } =
    await supabaseClient.auth.getUser();


  if (authError) {
    throw authError;
  }


  if (
    !authData.user
  ) {
    throw new Error(
      "An authenticated user is required to delete InnerMirror data."
    );
  }


  const {
    error,
  } =
    await supabaseClient.rpc(
      "delete_my_inner_mirror_data"
    );


  if (error) {
    throw error;
  }
}