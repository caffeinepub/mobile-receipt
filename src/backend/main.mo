import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Blob "mo:core/Blob";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  type Category = {
    id : Text;
    name : Text;
    icon : Text;
    updatedAt : Time.Time;
  };

  type Item = {
    id : Text;
    name : Text;
    categoryId : Text;
    price : Nat;
    updatedAt : Time.Time;
  };

  type BillItem = {
    itemId : Text;
    quantity : Nat;
    price : Nat;
  };

  type Bill = {
    id : Text;
    date : Text;
    items : [BillItem];
    total : Nat;
    updatedAt : Time.Time;
  };

  type Settings = {
    currency : Text;
    updatedAt : Time.Time;
  };

  type UserProfile = {
    name : Text;
  };

  type UserData = {
    categories : Map.Map<Text, Category>;
    items : Map.Map<Text, Item>;
    bills : Map.Map<Text, Bill>;
    settings : ?Settings;
    pdfBlobs : Map.Map<Text, Storage.ExternalBlob>;
  };

  let userData = Map.empty<Principal, UserData>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  func getUserStore(caller : Principal) : UserData {
    switch (userData.get(caller)) {
      case (null) {
        let newStore = {
          categories = Map.empty<Text, Category>();
          items = Map.empty<Text, Item>();
          bills = Map.empty<Text, Bill>();
          settings = null;
          pdfBlobs = Map.empty<Text, Storage.ExternalBlob>();
        };
        userData.add(caller, newStore);
        newStore;
      };
      case (?data) { data };
    };
  };

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Sync operations
  public shared ({ caller }) func syncCategory(category : Category) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can sync categories");
    };

    let userStore = getUserStore(caller);
    let existing = userStore.categories.get(category.id);

    if (existing == null or (switch (existing) { case (null) { false }; case (?old) { old.updatedAt < category.updatedAt } })) {
      userStore.categories.add(category.id, category);
      userData.add(caller, userStore);
    };
  };

  public shared ({ caller }) func syncItem(item : Item) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can sync items");
    };

    let userStore = getUserStore(caller);
    let existing = userStore.items.get(item.id);

    if (existing == null or (switch (existing) { case (null) { false }; case (?old) { old.updatedAt < item.updatedAt } })) {
      userStore.items.add(item.id, item);
      userData.add(caller, userStore);
    };
  };

  public shared ({ caller }) func syncBill(bill : Bill) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can sync bills");
    };

    let userStore = getUserStore(caller);
    let existing = userStore.bills.get(bill.id);

    if (existing == null or (switch (existing) { case (null) { false }; case (?old) { old.updatedAt < bill.updatedAt } })) {
      userStore.bills.add(bill.id, bill);
      userData.add(caller, userStore);
    };
  };

  public shared ({ caller }) func syncSettings(settings : Settings) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can sync settings");
    };

    let userStore = getUserStore(caller);
    switch (userStore.settings) {
      case (null) {
        userData.add(caller, { userStore with settings = ?settings });
      };
      case (?existing) {
        if (existing.updatedAt < settings.updatedAt) {
          userData.add(caller, { userStore with settings = ?settings });
        };
      };
    };
  };

  public shared ({ caller }) func uploadPdfBlob(id : Text, blob : Storage.ExternalBlob) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can upload PDF blobs");
    };
    let userStore = getUserStore(caller);
    userStore.pdfBlobs.add(id, blob);
    userData.add(caller, userStore);
  };

  // Query operations
  public query ({ caller }) func getCategories() : async [Category] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view categories");
    };

    let userStore = getUserStore(caller);
    userStore.categories.values().toArray();
  };

  public query ({ caller }) func getItems() : async [Item] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view items");
    };

    let userStore = getUserStore(caller);
    userStore.items.values().toArray();
  };

  public query ({ caller }) func getBills() : async [Bill] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view bills");
    };

    let userStore = getUserStore(caller);
    userStore.bills.values().toArray();
  };

  public query ({ caller }) func getSettings() : async ?Settings {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view settings");
    };

    let userStore = getUserStore(caller);
    userStore.settings;
  };

  public query ({ caller }) func getPdfBlob(id : Text) : async ?Storage.ExternalBlob {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view PDF blobs");
    };

    let userStore = getUserStore(caller);
    switch (userStore.pdfBlobs.get(id)) {
      case (null) { null };
      case (?externalBlob) { ?externalBlob };
    };
  };
};
