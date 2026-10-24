"""Procedural medieval figure and magical VFX, rendered using Blender's bpy.

Run: blender -b -t 2 --python scripts/blender/render_royal.py -- --output dist-blender
This is a first 3D asset pipeline, not a replacement for existing card art.
"""
import argparse
import math
import os
import sys
import bpy
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
parser = argparse.ArgumentParser()
parser.add_argument("--output", default="dist-blender")
options = parser.parse_args(args)
out = os.path.abspath(options.output)
os.makedirs(out, exist_ok=True)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

def material(name, color, metallic=0.0, roughness=0.45, emission=0.0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    bs = m.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value = (*color, 1)
    bs.inputs["Metallic"].default_value = metallic
    bs.inputs["Roughness"].default_value = roughness
    if emission:
        bs.inputs["Emission Color"].default_value = (*color, 1)
        bs.inputs["Emission Strength"].default_value = emission
    return m

gold = material("Royal brushed gold", (0.70, 0.40, 0.10), .75)
blue = material("Sapphire enamel", (0.035, 0.13, 0.35), .45)
skin = material("Warm skin", (0.58, 0.31, 0.20))
hair = material("Dark hair", (0.08, 0.045, 0.035))
steel = material("Sword steel", (0.53, 0.66, 0.71), .9, .2)
magic = material("Arcane cyan", (0.045, 0.68, 0.94), .1, .2, 2.0)
red = material("Ruby embers", (0.94, 0.12, 0.055), .1, .25, 1.7)

def sphere(name, pos, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=12, location=pos)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat)
    return obj

def cube(name, pos, scale, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    return obj

def cone(name, pos, r1, r2, depth, mat, vertices=24):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=r1, radius2=r2, depth=depth, location=pos)
    o=bpy.context.object
    o.name=name
    o.data.materials.append(mat)
    return o

sphere("Regal torso", (0,0,1.48), (.60,.31,.78), blue)
sphere("Left shoulder plate",(-.65,0,1.96),(.29,.32,.24),gold)
sphere("Right shoulder plate",(.65,0,1.96),(.29,.32,.24),gold)
sphere("Neck", (0,0,2.15), (.18,.18,.23),skin)
sphere("Distinctive royal face", (0,-.035,2.58),(.37,.30,.45),skin)
sphere("Hair silhouette", (0,.15,2.88),(.38,.23,.22),hair)
for side in (-1,1):
    sphere("Eye", (side*.14,-.285,2.61),(.045,.045,.04),hair)
    sphere("Armoured gauntlet", (side*.70,-.05,1.38),(.16,.18,.38),steel)
    sphere("Greave", (side*.27,0,.65),(.23,.24,.58),blue)
for i in range(5):
    angle=2*math.pi*i/5
    cone("Crown point",(.26*math.cos(angle),.26*math.sin(angle),3.16),.105,.018,.37,gold)
cone("Royal crown", (0,0,3.00), .34,.30,.21,gold)
cube("Sword hilt",(.88,-.34,1.52),(.09,.12,.6),gold)
cube("Sword blade",(.88,-.34,2.12),(.10,.055,.85),steel)
cube("Cross guard",(.88,-.34,1.81),(.39,.11,.07),gold)
sphere("Arcane shield core",(-.85,-.36,1.32),(.42,.09,.56),blue)
sphere("Shield sapphire",(-.85,-.47,1.34),(.21,.065,.30),magic)

# Three reusable VFX rings around the foot of the hero.
for layer,mat,radius in [("Sapphire shield",magic,.83),("Golden aura",gold,1.02),("Ruby attack",red,1.22)]:
    bpy.ops.mesh.primitive_torus_add(major_segments=48,minor_segments=8,location=(0,0,.15))
    ring=bpy.context.object
    ring.name="VFX "+layer
    ring.scale=(radius,radius,.40)
    ring.data.materials.append(mat)
    ring.hide_render=(layer!="Sapphire shield")

world=bpy.context.scene.world
world.color=(.025,.035,.07)
bpy.ops.object.light_add(type="AREA",location=(1,-4,6))
bpy.context.object.data.energy=1000
bpy.context.object.data.shape="DISK"
bpy.context.object.data.size=5
bpy.ops.object.light_add(type="AREA",location=(-3,2,4))
bpy.context.object.data.energy=600
bpy.context.object.data.color=(.30,.65,1.0)
bpy.ops.object.camera_add(location=(5,-8,4.0))
camera=bpy.context.object
direction=Vector((0,0,1.7))-camera.location
camera.rotation_euler=direction.to_track_quat("-Z","Y").to_euler()
bpy.context.scene.camera=camera
camera.data.type="ORTHO"
camera.data.ortho_scale=4.15
scene=bpy.context.scene
scene.render.engine="BLENDER_EEVEE"
scene.render.resolution_x=640
scene.render.resolution_y=896
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
scene.render.film_transparent=True
scene.render.filepath=os.path.join(out,"royal-hero.png")
bpy.ops.render.render(write_still=True)
print("3D render generated:", scene.render.filepath)
