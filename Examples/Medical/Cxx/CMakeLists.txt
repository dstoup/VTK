cmake_minimum_required(VERSION 2.8.5 FATAL_ERROR)

if(POLICY CMP0020)
  cmake_policy(SET CMP0020 NEW) # remove if CMake >= 2.8.11 required
endif()

PROJECT (Medical)

if(NOT VTK_BINARY_DIR)
  find_package(VTK COMPONENTS
    vtkCommonCore
    vtkCommonDataModel
    vtkCommonTransforms
    vtkFiltersCore
    vtkFiltersGeneral
    vtkFiltersGeometry
    vtkFiltersModeling
    vtkIOImage
    vtkIOXML
    vtkImagingCore
    vtkImagingStatistics
    vtkRenderingCore
    vtkRenderingOpenGL
    vtkRenderingVolume
    vtkRenderingVolumeOpenGL
    vtkInteractionStyle
  )
  include(${VTK_USE_FILE})
endif()

add_executable(Medical1 MACOSX_BUNDLE Medical1.cxx)
add_executable(Medical2 MACOSX_BUNDLE Medical2.cxx)
add_executable(Medical3 MACOSX_BUNDLE Medical3.cxx)
add_executable(Medical4 MACOSX_BUNDLE Medical4.cxx)

target_link_libraries(Medical1 ${VTK_LIBRARIES})
target_link_libraries(Medical2 ${VTK_LIBRARIES})
target_link_libraries(Medical3 ${VTK_LIBRARIES})
target_link_libraries(Medical4 ${VTK_LIBRARIES})

add_executable(GenerateModelsFromLabels MACOSX_BUNDLE GenerateModelsFromLabels.cxx)
add_executable(GenerateCubesFromLabels MACOSX_BUNDLE  GenerateCubesFromLabels.cxx)
target_link_libraries(GenerateModelsFromLabels ${VTK_LIBRARIES})
target_link_libraries(GenerateCubesFromLabels ${VTK_LIBRARIES})

if(BUILD_TESTING)
  if(vtkTestingRendering_LOADED)
    ######## Regression Testing ########
    set(vtk-example MedicalExamples)
    set(TestMedical1_ARGS ${VTK_TEST_DATA_DIR}/Data/headsq/quarter)
    set(TestMedical2_ARGS ${VTK_TEST_DATA_DIR}/Data/headsq/quarter)
    set(TestMedical3_ARGS ${VTK_TEST_DATA_DIR}/Data/headsq/quarter)
    set(TestMedical4_ARGS ${VTK_TEST_DATA_DIR}/Data/headsq/quarter)
    vtk_add_test_cxx(
      TestMedical1.cxx
      TestMedical2.cxx
      TestMedical3.cxx
      TestMedical4.cxx
      )
    vtk_test_cxx_executable(${vtk-example}CxxTests RENDERING_FACTORY)
  endif()
endif()
