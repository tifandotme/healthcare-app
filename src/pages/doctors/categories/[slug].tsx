import React from "react"
import type { GetServerSideProps, InferGetServerSidePropsType } from "next"
import Head from "next/head"

import type { ResponseGetAll, Specialization } from "@/types/api"
import { useDoctorList } from "@/lib/fetchers"
import { unslugify } from "@/lib/utils"
import MainLayout from "@/components/layout/main-layout"
import DoctorSearch from "@/features/consultation/component/doctorSearch/doctorSearch"

export const getServerSideProps: GetServerSideProps<{
  category: Specialization[]
}> = async (context) => {
  const slug = context.params?.slug as string
  const url = new URL(`/v1/doctor-specs`, process.env.NEXT_PUBLIC_DB_URL)
  const res = await fetch(url)
  const decoded: ResponseGetAll<Specialization[]> = await res.json()
  const items = decoded.data.items
  const category = items.filter(
    (value) => value.name.toLowerCase() === unslugify(slug).toLowerCase(),
  )

  if (category.length === 0) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      category,
    },
  }
}

function DoctorsByCategoryPage({
  category,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { doctorIsLoading, doctorList } = useDoctorList(category[0]?.name)

  return (
    <div className="flex h-full min-h-full flex-auto gap-10">
      <Head>
        <title>ByeByeSick | {category[0]?.name}</title>
      </Head>
      <div className="w-full">
        {doctorIsLoading ? (
          <>loading</>
        ) : (
          category && (
            <DoctorSearch
              title={category[0]?.name}
              DoctorList={doctorList?.data.items}
            />
          )
        )}
      </div>
    </div>
  )
}
DoctorsByCategoryPage.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>
}
export default DoctorsByCategoryPage
