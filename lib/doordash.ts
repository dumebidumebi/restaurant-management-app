import { DoorDashClient } from "@doordash/sdk";
import { v4 as uuidv4 } from "uuid";

export const doordash = new DoorDashClient({
    developer_id: "d00670c5-3798-40f4-b3f5-ffdea4a27d1e",
    key_id: "77496257-0b14-44ea-b2d7-3edecce12679",
    signing_secret: "YvUMDNp9VnvS4jKOBY3GesNsytEy5Egt6sIX9RIxofo"
  });