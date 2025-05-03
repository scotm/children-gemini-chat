import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { UserProfile } from "@/lib/userProfile";

type ProfileSelectorProps = {
	userProfiles: UserProfile[];
	selectedProfile: UserProfile;
	onProfileChange: (profile: UserProfile) => void;
};

export function ProfileSelector({
	userProfiles,
	selectedProfile,
	onProfileChange,
}: ProfileSelectorProps) {
	return (
		<Select
			onValueChange={(value) => {
				const profile = userProfiles.find((p) => p.age.toString() === value);
				if (profile) {
					onProfileChange(profile);
				}
			}}
			value={selectedProfile.age.toString()}
		>
			<SelectTrigger className="w-[180px]">
				<SelectValue placeholder="Select profile" />
			</SelectTrigger>
			<SelectContent>
				{userProfiles.map((profile) => (
					<SelectItem key={profile.age} value={profile.age.toString()}>
						{profile.age} years old
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
