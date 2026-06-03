import { useRouter } from "next/navigation";

export function useNavigation() {
  const router = useRouter();

  const navigateTo = ({ route }: { route: string }) => router.push(route);

  const replace = ({ route }: { route: string }) => router.replace(route);

  const back = () => router.back();

  const refresh = () => router.refresh();

  return { navigateTo, replace, back, refresh };
}
