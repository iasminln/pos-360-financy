import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client/react";
import { LogOut, Mail, User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { UPDATE_PROFILE_MUTATION } from "@/graphql/operations";
import { useAuth } from "@/context/auth-context";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

type FormValues = z.infer<typeof schema>;

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? "" },
  });

  useEffect(() => {
    if (user) reset({ name: user.name });
  }, [user, reset]);

  const [updateProfile] = useMutation(UPDATE_PROFILE_MUTATION);

  const onSubmit = handleSubmit(async (values) => {
    setMessage("");
    setError("");
    try {
      const { data } = await updateProfile({
        variables: { name: values.name },
      });
      const payload = data as { updateProfile: import("@/lib/types").User };
      setUser(payload.updateProfile);
      setMessage("Alterações salvas com sucesso");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar as alterações",
      );
    }
  });

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-border bg-white p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Avatar name={user.name} size="lg" />
          <h1 className="mt-4 text-xl font-bold text-gray-800">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        <div className="mb-6 border-t border-border" />

        <form onSubmit={onSubmit} className="space-y-4">
          <Field
            label="Nome completo"
            htmlFor="name"
            error={errors.name?.message}
          >
            <Input
              id="name"
              placeholder="Seu nome"
              leftIcon={<User className="h-4 w-4" />}
              {...register("name")}
            />
          </Field>

          <Field
            label="E-mail"
            htmlFor="email"
            helper="O e-mail não pode ser alterado"
            disabled
          >
            <Input
              id="email"
              value={user.email}
              disabled
              leftIcon={<Mail className="h-4 w-4" />}
            />
          </Field>

          {message && <p className="text-sm text-success">{message}</p>}
          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>

        <Button
          variant="danger"
          size="lg"
          className="mt-3 w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
